import { Hono } from "hono";
import { db } from "../database";
import { invitations, userRoles } from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, requireEditor } from "../middleware/auth";
import { randomBytes } from "crypto";

export const adminRoutes = new Hono()
  // Get current user's role
  .get("/me/role", requireEditor, async (c) => {
    const user = c.get("user")!;
    const [roleRow] = await db.select().from(userRoles).where(eq(userRoles.userId, user.id));
    return c.json({ role: roleRow?.role ?? "viewer", user }, 200);
  })
  // Get all users with roles (admin only)
  .get("/users", requireAdmin, async (c) => {
    const rows = await db.select().from(userRoles);
    return c.json({ users: rows }, 200);
  })
  // Update user role (admin only)
  .put("/users/:userId/role", requireAdmin, async (c) => {
    const userId = c.req.param("userId");
    const { role } = await c.req.json();
    const existing = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    if (existing.length > 0) {
      await db.update(userRoles).set({ role }).where(eq(userRoles.userId, userId));
    } else {
      await db.insert(userRoles).values({ userId, role });
    }
    return c.json({ ok: true }, 200);
  })
  // Create invitation link (admin only)
  .post("/invitations", requireAdmin, async (c) => {
    const user = c.get("user")!;
    const { role, email } = await c.req.json();
    const token = randomBytes(32).toString("hex");
    const [inv] = await db.insert(invitations).values({
      email: email ?? null,
      token,
      role: role ?? "editor",
      createdBy: user.id,
    }).returning();
    return c.json({ invitation: inv, token }, 201);
  })
  // List invitations (admin only)
  .get("/invitations", requireAdmin, async (c) => {
    const rows = await db.select().from(invitations);
    return c.json({ invitations: rows }, 200);
  })
  // Use invitation token — anyone can call this after sign-up
  .post("/invitations/use", async (c) => {
    const { token, userId } = await c.req.json();
    const [inv] = await db.select().from(invitations).where(eq(invitations.token, token));
    if (!inv) return c.json({ message: "Invalid token" }, 404);
    if (inv.usedAt) return c.json({ message: "Token already used" }, 400);
    // Assign role
    const existing = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    if (existing.length > 0) {
      await db.update(userRoles).set({ role: inv.role }).where(eq(userRoles.userId, userId));
    } else {
      await db.insert(userRoles).values({ userId, role: inv.role });
    }
    // Mark used
    await db.update(invitations).set({ usedAt: new Date() }).where(eq(invitations.token, token));
    return c.json({ ok: true, role: inv.role }, 200);
  })
  // Register as first admin (only if NO admins exist yet)
  .post("/setup", async (c) => {
    const { userId } = await c.req.json();
    const existing = await db.select().from(userRoles).where(eq(userRoles.role, "admin"));
    if (existing.length > 0) return c.json({ message: "Already set up" }, 403);
    await db.insert(userRoles).values({ userId, role: "admin" });
    return c.json({ ok: true }, 200);
  });
