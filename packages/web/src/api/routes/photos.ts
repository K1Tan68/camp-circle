import { Hono } from "hono";
import { db } from "../database";
import { photos } from "../database/schema";
import { eq, asc } from "drizzle-orm";
import { requireEditor } from "../middleware/auth";
import { s3, getPublicUrl } from "../lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const photosRoutes = new Hono()
  .get("/", async (c) => {
    const rows = await db.select().from(photos).orderBy(asc(photos.order));
    return c.json({ photos: rows }, 200);
  })
  .post("/presign", requireEditor, async (c) => {
    const { filename, contentType } = await c.req.json();
    const key = `gallery/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 600 }
    );
    return c.json({ url, key }, 200);
  })
  .post("/", requireEditor, async (c) => {
    const body = await c.req.json();
    const publicUrl = getPublicUrl(body.s3Key);
    const [row] = await db.insert(photos).values({
      url: publicUrl,
      s3Key: body.s3Key,
      caption: body.caption ?? "",
      takenAt: body.takenAt ?? "",
      location: body.location ?? "",
      description: body.description ?? "",
      order: body.order ?? 0,
    }).returning();
    return c.json({ photo: row }, 201);
  })
  .delete("/:id", requireEditor, async (c) => {
    const id = parseInt(c.req.param("id"));
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    if (photo?.s3Key) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: photo.s3Key }));
      } catch (_) {}
    }
    await db.delete(photos).where(eq(photos.id, id));
    return c.json({ ok: true }, 200);
  });
