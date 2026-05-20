// Class names fix script
// Run: node fix_classnames.mjs

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

try {
  const envFile = readFileSync(".env.local", "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) process.env[key.trim()] = val.join("=").trim();
  });
} catch {
  console.error("❌ .env.local नहीं मिली!");
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const fixes = [
  { from: "3rd",  to: "3" },
  { from: "4th",  to: "4" },
  { from: "5th",  to: "5" },
  { from: "6th",  to: "6" },
  { from: "7th",  to: "7" },
  { from: "8th",  to: "8" },
  { from: "9th",  to: "9" },
  { from: "10th", to: "10" },
];

async function main() {
  console.log("🔧 Class names fix हो रहे हैं...\n");
  for (const f of fixes) {
    const result = await client.execute({
      sql: "UPDATE timetable SET class = ? WHERE class = ?",
      args: [f.to, f.from],
    });
    console.log(`✅ "${f.from}" → "${f.to}" (${result.rowsAffected} rows)`);
  }
  console.log("\n🎉 Done! अब app में जाकर Show करो।");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
