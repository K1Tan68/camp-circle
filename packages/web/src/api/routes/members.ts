import { Hono } from "hono";
import { db } from "../database";
import { members } from "../database/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import { s3, getPublicUrl } from "../lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const membersRoutes = new Hono()
  .get("/", async (c) => {
    const rows = await db.select().from(members).orderBy(asc(members.order));
    return c.json({ members: rows }, 200);
  })
  // Presigned URL for member avatar upload
  .post("/presign", requireAdmin, async (c) => {
    const { filename, contentType } = await c.req.json();
    const key = `members/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 600 }
    );
    const publicUrl = getPublicUrl(key);
    return c.json({ url, key, publicUrl }, 200);
  })
  .post("/", requireAdmin, async (c) => {
    const body = await c.req.json();
    const [row] = await db.insert(members).values({
      name: body.name,
      year: body.year,
      role: body.role ?? "一般",
      bio: body.bio ?? "",
      imageUrl: body.imageUrl ?? "",
      order: body.order ?? 0,
    }).returning();
    return c.json({ member: row }, 201);
  })
  .put("/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const [row] = await db.update(members).set({
      name: body.name,
      year: body.year,
      role: body.role,
      bio: body.bio,
      imageUrl: body.imageUrl,
      order: body.order,
    }).where(eq(members.id, id)).returning();
    return c.json({ member: row }, 200);
  })
  .delete("/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    // Try to delete avatar from R2 if it's our upload
    const [m] = await db.select().from(members).where(eq(members.id, id));
    if (m?.imageUrl && m.imageUrl.includes(process.env.S3_BUCKET ?? "")) {
      try {
        // Extract key from URL
        const key = m.imageUrl.split("/").slice(3).join("/");
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
      } catch (_) {}
    }
    await db.delete(members).where(eq(members.id, id));
    return c.json({ ok: true }, 200);
  });
