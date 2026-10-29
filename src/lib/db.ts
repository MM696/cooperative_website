import pkg from "pg";
const { Pool } = pkg;
import type { QueryResultRow, QueryResult } from "pg";

let pool: InstanceType<typeof Pool> | null = null;

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Did you forget to create .env.local?");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }

  return pool;
}

/**
 * Type-safe query helper.
 * T = shape of a single row, NOT an array.
 */
export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}
