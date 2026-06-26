import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./packages/web/src/api/database/schema";
import { members, events, posts } from "./packages/web/src/api/database/schema";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

async function main() {
  // --- Clear existing data ---
  await db.delete(posts);
  await db.delete(events);
  await db.delete(members);
  console.log("Cleared existing data");

  // --- Members: 4人（仮） ---
  await db.insert(members).values([
    { name: "メンバーA", year: 1, role: "部長", bio: "", imageUrl: "", order: 1 },
    { name: "メンバーB", year: 2, role: "副部長", bio: "", imageUrl: "", order: 2 },
    { name: "メンバーC", year: 1, role: "SNS担当", bio: "", imageUrl: "", order: 3 },
    { name: "メンバーD", year: 2, role: "一般", bio: "", imageUrl: "", order: 4 },
  ]);
  console.log("Members inserted");

  // --- Events: 2026年 1〜12月 全部「調整中」 ---
  const months = [
    { month: "1月", monthNum: 1 },
    { month: "2月", monthNum: 2 },
    { month: "3月", monthNum: 3 },
    { month: "4月", monthNum: 4 },
    { month: "5月", monthNum: 5 },
    { month: "6月", monthNum: 6 },
    { month: "7月", monthNum: 7 },
    { month: "8月", monthNum: 8 },
    { month: "9月", monthNum: 9 },
    { month: "10月", monthNum: 10 },
    { month: "11月", monthNum: 11 },
    { month: "12月", monthNum: 12 },
  ];
  await db.insert(events).values(
    months.map(m => ({
      month: m.month,
      monthNum: m.monthNum,
      title: "調整中",
      location: "",
      description: "",
      year: 2026,
    }))
  );
  console.log("Events inserted");

  // Posts: 空のまま（削除済み）
  console.log("Done!");
}

main().catch(console.error);
