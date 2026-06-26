import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./src/api/database/schema";
import { members, events, posts } from "./src/api/database/schema";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

async function main() {
  await db.delete(posts);
  await db.delete(events);
  await db.delete(members);
  console.log("Cleared");

  await db.insert(members).values([
    { name: "メンバーA", year: 1, role: "部長", bio: "", imageUrl: "", order: 1 },
    { name: "メンバーB", year: 2, role: "副部長", bio: "", imageUrl: "", order: 2 },
    { name: "メンバーC", year: 1, role: "SNS担当", bio: "", imageUrl: "", order: 3 },
    { name: "メンバーD", year: 2, role: "一般", bio: "", imageUrl: "", order: 4 },
  ]);
  console.log("Members: 4人 inserted");

  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  await db.insert(events).values(
    months.map((m, i) => ({
      month: m,
      monthNum: i + 1,
      title: "調整中",
      location: "",
      description: "",
      year: 2026,
    }))
  );
  console.log("Events: 2026年 1〜12月 inserted");
  console.log("Done!");
}

main().catch(console.error);
