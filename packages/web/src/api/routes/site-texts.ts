import { Hono } from "hono";
import { db } from "../database";
import { siteTexts } from "../database/schema";
import { eq } from "drizzle-orm";
import { requireEditor } from "../middleware/auth";

// Default site text blocks (seeded on first GET if empty)
const DEFAULTS: { key: string; label: string; value: string }[] = [
  { key: "hero_title", label: "ヒーロー：サークル名", value: "桃山のキャンパー" },
  { key: "hero_subtitle", label: "ヒーロー：キャッチコピー", value: "自然と仲間と、非日常の体験を。\n桃山学院大学公認キャンプサークル。" },
  { key: "about_title", label: "About：タイトル", value: "私たちについて" },
  { key: "about_body", label: "About：本文", value: "桃山学院大学のキャンプサークルは、初心者から経験者まで誰でも楽しめるアウトドア活動を行っています。年間を通じてキャンプや登山、バーベキューなどのイベントを開催し、自然の中で仲間との絆を深めています。" },
  { key: "join_title", label: "加入：タイトル", value: "一緒にキャンプしよう！" },
  { key: "join_body", label: "加入：説明文", value: "初心者大歓迎！道具がなくても大丈夫。\n楽しいキャンプライフを一緒に始めましょう。" },
  { key: "join_instagram", label: "加入：Instagram URL", value: "" },
  { key: "join_twitter", label: "加入：Twitter/X URL", value: "" },
  { key: "join_line", label: "加入：LINE URL", value: "" },
  { key: "footer_message", label: "フッター：メッセージ", value: "© 2025 桃山学院大学キャンプサークル" },
];

export const siteTextsRoutes = new Hono()
  // Public GET — returns all site texts (or defaults)
  .get("/", async (c) => {
    const rows = await db.select().from(siteTexts);

    if (rows.length === 0) {
      // Seed defaults
      await db.insert(siteTexts).values(DEFAULTS).onConflictDoNothing();
      return c.json({ texts: DEFAULTS.map((d, i) => ({ id: i + 1, ...d, updatedAt: new Date() })) });
    }

    // Merge missing defaults
    const existingKeys = new Set(rows.map(r => r.key));
    const missing = DEFAULTS.filter(d => !existingKeys.has(d.key));
    if (missing.length > 0) {
      await db.insert(siteTexts).values(missing).onConflictDoNothing();
      const updated = await db.select().from(siteTexts);
      return c.json({ texts: updated });
    }

    return c.json({ texts: rows });
  })
  // Editor/Admin PUT — update a single key
  .put("/:key", requireEditor, async (c) => {
    const key = c.req.param("key");
    const { value } = await c.req.json();
    const existing = await db.select().from(siteTexts).where(eq(siteTexts.key, key));
    if (existing.length === 0) {
      // Insert new
      const def = DEFAULTS.find(d => d.key === key);
      const [row] = await db.insert(siteTexts).values({
        key,
        label: def?.label ?? key,
        value: value ?? "",
      }).returning();
      return c.json({ text: row });
    }
    const [row] = await db.update(siteTexts)
      .set({ value: value ?? "", updatedAt: new Date() })
      .where(eq(siteTexts.key, key))
      .returning();
    return c.json({ text: row });
  });
