import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

try {
  const envFile = readFileSync(".env.local", "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) process.env[key.trim()] = val.join("=").trim();
  });
} catch { process.exit(1); }

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute({
  sql: "UPDATE timetable SET user_id = 2 WHERE user_id = 3",
  args: [],
});

console.log(`✅ ${result.rowsAffected} rows fix हो गए!`);