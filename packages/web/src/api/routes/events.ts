import { Hono } from "hono";
import { db } from "../database";
import { events } from "../database/schema";
import { eq, asc } from "drizzle-orm";
import { requireEditor } from "../middleware/auth";

export const eventsRoutes = new Hono()
  .get("/", async (c) => {
    const year = c.req.query("year") ? parseInt(c.req.query("year")!) : new Date().getFullYear();
    const rows = await db.select().from(events).where(eq(events.year, year)).orderBy(asc(events.monthNum), asc(events.date));
    return c.json({ events: rows }, 200);
  })
  .post("/", requireEditor, async (c) => {
    const body = await c.req.json();
    const [row] = await db.insert(events).values({
      month: body.month,
      monthNum: body.monthNum ?? parseInt(body.month) ?? 1,
      date: body.date ?? "",
      title: body.title,
      location: body.location ?? "",
      description: body.description ?? "",
      year: body.year ?? new Date().getFullYear(),
    }).returning();
    return c.json({ event: row }, 201);
  })
  .put("/:id", requireEditor, async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const [row] = await db.update(events).set({
      month: body.month,
      monthNum: body.monthNum ?? parseInt(body.month) ?? 1,
      date: body.date ?? "",
      title: body.title,
      location: body.location ?? "",
      description: body.description ?? "",
      year: body.year,
    }).where(eq(events.id, id)).returning();
    return c.json({ event: row }, 200);
  })
  .delete("/:id", requireEditor, async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.delete(events).where(eq(events.id, id));
    return c.json({ ok: true }, 200);
  });
