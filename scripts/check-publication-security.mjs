import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const pool = new pg.Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
try {
  const access = await pool.query(`
    select
      has_table_privilege('anon', 'public.students', 'select') as students,
      has_table_privilege('anon', 'public.invitations', 'select') as invitations,
      has_function_privilege('anon', 'public.verify_teacher_login(text,text)', 'execute') as teacher_rpc,
      public.verify_teacher_login('TestTeacher', '123321') as weak_teacher_password
  `);
  const policies = await pool.query(`
    select tablename, policyname from pg_policies
    where schemaname='public' and tablename in ('students','invitations')
      and ('public' = any(roles) or 'anon' = any(roles))
  `);
  const result = access.rows[0];
  const safe = !result.students && !result.invitations && !result.teacher_rpc &&
    !result.weak_teacher_password && policies.rows.length === 0;
  console.log(JSON.stringify({
    publicStudentRead: result.students,
    publicInvitationRead: result.invitations,
    publicTeacherPasswordCheck: result.teacher_rpc,
    weakTeacherPassword: result.weak_teacher_password,
    publicPolicies: policies.rows.length,
    readyToPublish: safe,
  }));
  if (!safe) process.exitCode = 1;
} finally {
  await pool.end();
}
