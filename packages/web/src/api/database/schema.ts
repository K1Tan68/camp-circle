import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

// Members
export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  year: integer("year").notNull(), // e.g. 1,2,3,4
  role: text("role").notNull().default("一般"), // e.g. 部長, 副部長, SNS担当, 一般
  bio: text("bio"),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Events / Schedule（月ごとに複数件登録可、日付付き）
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: text("month").notNull(), // e.g. "4月"
  monthNum: integer("month_num").notNull().default(1), // for sorting
  date: text("date"),             // 日付 e.g. "2026-07-15"
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  year: integer("year").notNull(), // event year e.g. 2026
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Gallery photos（サークル企画の写真、月ごとにグループ化）
export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  s3Key: text("s3_key").notNull(),
  eventTitle: text("event_title"), // 企画名 e.g. "夏合宿2026"
  month: text("month"),            // e.g. "8月"
  monthNum: integer("month_num").notNull().default(0), // for sorting/filter
  year: integer("year").notNull().default(2026),
  caption: text("caption"),        // 説明
  takenAt: text("taken_at"),       // 日付 e.g. "2024-08-15"
  location: text("location"),      // 場所 e.g. "道志の森"
  description: text("description"),// 詳細説明
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Blog posts / 活動報告（メンバー個人記事、複数写真対応）
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  tag: text("tag").notNull().default("活動報告"), // e.g. 活動報告, ノウハウ
  authorId: text("author_id").notNull(),
  authorName: text("author_name"),  // 著者名（表示用）
  month: text("month"),             // e.g. "8月"
  monthNum: integer("month_num").notNull().default(0), // for sorting/filter
  year: integer("year").notNull().default(2026),
  photos: text("photos"),           // JSON array of {url, s3Key} 複数写真
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 管理者メールアドレス許可リスト（後から追加可能）
export const adminEmails = sqliteTable("admin_emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  label: text("label"),            // e.g. "部長", "SNS担当"
  role: text("role").notNull().default("editor"),  // "admin"(メール管理可) or "editor"
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin/editor invitations
export const invitations = sqliteTable("invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email"),
  token: text("token").notNull().unique(),
  role: text("role").notNull().default("editor"), // admin | editor
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Site-wide editable text blocks
export const siteTexts = sqliteTable("site_texts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),    // e.g. "hero_title", "about_body"
  label: text("label").notNull(),          // Human-readable label
  value: text("value").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// App users with roles (extends better-auth user table via userId)
export const userRoles = sqliteTable("user_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(),
  role: text("role").notNull().default("viewer"), // admin | editor | viewer
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
