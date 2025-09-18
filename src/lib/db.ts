import pkg from "pg";
const { Pool } = pkg;
import type { QueryResultRow, QueryResult } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("\n[DB] ❌ FATAL: DATABASE_URL is not set!\n");
  throw new Error("DATABASE_URL is not set. Did you forget to create .env.local?");
} else {
  const safeUrl = process.env.DATABASE_URL.replace(/:\/\/(.*?):(.*?)@/, "://****:****@");
  console.log(`[DB] ✅ DATABASE_URL found: ${safeUrl}`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool
  .connect()
  .then(() => console.log("[DB] ✅ Connected successfully"))
  .catch((err: Error) => {
    console.error("[DB] ❌ Connection error:", err.message);
    throw err;
  });

/**
 * Type-safe query helper.
 * T = shape of a single row, NOT an array.
 */
export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
  console.log(`[DB] 📝 Running query: ${text} with params: ${JSON.stringify(params)}`);
  return pool.query<T>(text, params);
}
