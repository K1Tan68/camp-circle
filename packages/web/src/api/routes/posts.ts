import { Hono } from "hono";
import { db } from "../database";
import { posts } from "../database/schema";
import { eq, desc, asc } from "drizzle-orm";
import { requireEditor } from "../middleware/auth";

export const postsRoutes = new Hono()
  .get("/", async (c) => {
    const all = c.req.query("all") === "true";
    let rows;
    if (all) {
      rows = await db.select().from(posts).orderBy(desc(posts.monthNum), desc(posts.createdAt));
    } else {
      rows = await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.monthNum), desc(posts.createdAt));
    }
    return c.json({ posts: rows }, 200);
  })
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const [row] = await db.select().from(posts).where(eq(posts.id, id));
    if (!row) return c.json({ message: "Not found" }, 404);
    return c.json({ post: row }, 200);
  })
  .post("/", requireEditor, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json();
    const [row] = await db.insert(posts).values({
      title: body.title,
      content: body.content,
      excerpt: body.excerpt ?? body.content.slice(0, 100) + "…",
      tag: body.tag ?? "活動報告",
      authorId: user.id,
      authorName: body.authorName ?? user.name ?? "",
      month: body.month ?? "",
      monthNum: body.monthNum ?? 0,
      year: body.year ?? new Date().getFullYear(),
      photos: body.photos ? JSON.stringify(body.photos) : null,
      published: body.published ?? false,
    }).returning();
    return c.json({ post: row }, 201);
  })
  .put("/:id", requireEditor, async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const [row] = await db.update(posts).set({
      title: body.title,
      content: body.content,
      excerpt: body.excerpt ?? body.content.slice(0, 100) + "…",
      tag: body.tag,
      authorName: body.authorName,
      month: body.month,
      monthNum: body.monthNum,
      year: body.year,
      photos: body.photos ? JSON.stringify(body.photos) : null,
      published: body.published,
      updatedAt: new Date(),
    }).where(eq(posts.id, id)).returning();
    return c.json({ post: row }, 200);
  })
  .delete("/:id", requireEditor, async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.delete(posts).where(eq(posts.id, id));
    return c.json({ ok: true }, 200);
  });
