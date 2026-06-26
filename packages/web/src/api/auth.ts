import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { eq } from "drizzle-orm";
import { db } from "./database";
import { adminEmails, userRoles } from "./database/schema";

const googleEnabled =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    // サインアップ前に許可メールリストをチェック
    async sendVerificationEmail() {},
  },
  databaseHooks: {
    user: {
      create: {
        // 新規ユーザー作成前に許可リストを確認。許可されてないメールは拒否
        before: async (user) => {
          const email = (user.email ?? "").toLowerCase().trim();
          const [allowed] = await db
            .select()
            .from(adminEmails)
            .where(eq(adminEmails.email, email));
          if (!allowed || !allowed.active) {
            throw new Error("このメールアドレスは管理者として許可されていません");
          }
          return { data: user };
        },
        // 作成後に許可リストの role を付与（admin or editor）
        after: async (user) => {
          try {
            const email = (user.email ?? "").toLowerCase().trim();
            const [allowed] = await db
              .select()
              .from(adminEmails)
              .where(eq(adminEmails.email, email));
            const role = allowed?.role === "admin" ? "admin" : "editor";
            const existing = await db
              .select()
              .from(userRoles)
              .where(eq(userRoles.userId, user.id));
            if (existing.length === 0) {
              await db.insert(userRoles).values({ userId: user.id, role });
            }
          } catch (_) {}
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  plugins: [bearer(), expo()],
  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
});
