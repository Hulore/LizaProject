import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import pg from "pg";
nextEnv.loadEnvConfig(process.cwd());
const pool = new pg.Pool({connectionString:process.env.SUPABASE_DB_URL,ssl:{rejectUnauthorized:false}});
try {
  const sql = await readFile(new URL('../supabase/migrations/20260929_task_management.sql',import.meta.url),'utf8');
  await pool.query(sql);
  console.log('Task management migration applied.');
} finally { await pool.end(); }
