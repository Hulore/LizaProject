import "server-only";

import { Pool } from "pg";

declare global {
  var lizaPostgresPool: Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.SUPABASE_DB_URL;

  if (!databaseUrl) {
    throw new Error("SUPABASE_DB_URL is not configured.");
  }

  return databaseUrl;
}

export function getPostgresPool() {
  if (!globalThis.lizaPostgresPool) {
    globalThis.lizaPostgresPool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }

  return globalThis.lizaPostgresPool;
}
