import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import { db } from "../database";
import { userRoles } from "../database/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  if (!c.get("user")) return c.json({ message: "Unauthorized" }, 401);
  return next();
});

export const requireEditor = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const [roleRow] = await db.select().from(userRoles).where(eq(userRoles.userId, user.id));
  const role = roleRow?.role ?? "viewer";
  if (role !== "admin" && role !== "editor") return c.json({ message: "Forbidden" }, 403);
  c.set("userRole", role);
  return next();
});

export const requireAdmin = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const [roleRow] = await db.select().from(userRoles).where(eq(userRoles.userId, user.id));
  if (roleRow?.role !== "admin") return c.json({ message: "Forbidden" }, 403);
  c.set("userRole", "admin");
  return next();
});
