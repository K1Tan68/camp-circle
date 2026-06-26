import { Hono } from "hono";
import { db } from "../database";
import { invitations, userRoles, adminEmails } from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, requireEditor } from "../middleware/auth";
import { randomBytes } from "crypto";

export const adminRoutes = new Hono()
  // === 許可メールアドレス管理 ===
  // メールが許可リストにあるか確認（サインアップ前チェック、公開）
  .get("/allowed-emails/check", async (c) => {
    const email = (c.req.query("email") ?? "").toLowerCase().trim();
    if (!email) return c.json({ allowed: false }, 200);
    const [row] = await db.select().from(adminEmails).where(eq(adminEmails.email, email));
    return c.json({ allowed: !!row && row.active, label: row?.label ?? null }, 200);
  })
  // 許可メール一覧（admin only）
  .get("/allowed-emails", requireAdmin, async (c) => {
    const rows = await db.select().from(adminEmails);
    return c.json({ emails: rows }, 200);
  })
  // 許可メール追加（admin only）
  .post("/allowed-emails", requireAdmin, async (c) => {
    const { email, label, role } = await c.req.json();
    const clean = (email ?? "").toLowerCase().trim();
    if (!clean) return c.json({ message: "メールアドレスが必要です" }, 400);
    const existing = await db.select().from(adminEmails).where(eq(adminEmails.email, clean));
    if (existing.length > 0) return c.json({ message: "既に登録済みです" }, 409);
    const cleanRole = role === "admin" ? "admin" : "editor";
    const [row] = await db.insert(adminEmails).values({ email: clean, label: label ?? "", role: cleanRole, active: true }).returning();
    return c.json({ email: row }, 201);
  })
  // 許可メール 有効/無効切り替え（admin only）
  .put("/allowed-emails/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    const { active, label } = await c.req.json();
    const [row] = await db.update(adminEmails).set({
      ...(active !== undefined ? { active } : {}),
      ...(label !== undefined ? { label } : {}),
    }).where(eq(adminEmails.id, id)).returning();
    return c.json({ email: row }, 200);
  })
  // 許可メール削除（admin only）
  .delete("/allowed-emails/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.delete(adminEmails).where(eq(adminEmails.id, id));
    return c.json({ ok: true }, 200);
  })
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
