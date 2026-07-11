import { randomBytes } from "crypto";
import { getPostgresPool } from "@/lib/postgres";

export type Invitation = {
  code: string;
  isUsed: boolean;
  createdAt: string;
};

function createInviteCode() {
  const first = randomBytes(2).toString("hex").toUpperCase();
  const second = randomBytes(2).toString("hex").toUpperCase();

  return `LZ-${first}-${second}`;
}

const inviteCodePattern = /^LZ-[0-9A-F]{4}-[0-9A-F]{4}$/;

export function isInviteCode(value: string) {
  return inviteCodePattern.test(value);
}

export async function createInvitationForTeacher(teacherLogin: string, requestedCode?: string) {
  const pool = getPostgresPool();
  const codes = requestedCode ? [requestedCode] : Array.from({ length: 5 }, () => createInviteCode());

  for (const code of codes) {
    if (!isInviteCode(code)) {
      continue;
    }

    const result = await pool.query<{ code: string }>(
      `
        insert into public.invitations (code, created_by)
        select $1, id
        from public.teacher_accounts
        where login = $2
        on conflict (code) do nothing
        returning code
      `,
      [code, teacherLogin],
    );

    if (result.rows[0]?.code) {
      return result.rows[0].code;
    }
  }

  throw new Error(requestedCode ? "Такой код приглашения уже занят." : "Не получилось создать уникальное приглашение.");
}

export async function getRecentInvitations(limit = 5): Promise<Invitation[]> {
  const pool = getPostgresPool();
  const result = await pool.query<{
    code: string;
    is_used: boolean;
    created_at: Date;
  }>(
    `
      select code, is_used, created_at
      from public.invitations
      order by created_at desc
      limit $1
    `,
    [limit],
  );

  return result.rows.map((invitation) => ({
    code: invitation.code,
    isUsed: invitation.is_used,
    createdAt: invitation.created_at.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
}

export async function registerStudentByInvitation({
  code,
  name,
  login,
  password,
}: {
  code: string;
  name: string;
  login: string;
  password: string;
}) {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const invitation = await client.query<{ id: string }>(
      `
        select id
        from public.invitations
        where code = $1
          and is_used = false
          and (expires_at is null or expires_at > now())
        for update
      `,
      [code],
    );

    if (!invitation.rows[0]) {
      await client.query("rollback");
      return { ok: false, reason: "invite" as const };
    }

    const existing = await client.query("select 1 from public.students where login = $1", [login]);

    if (existing.rowCount) {
      await client.query("rollback");
      return { ok: false, reason: "login" as const };
    }

    const student = await client.query<{ id: number }>(
      `
        insert into public.students
          (name, login, password_hash, invite_code, subjects, exams, last_activity, completed_tasks, average_score)
        values
          ($1, $2, extensions.crypt($3, extensions.gen_salt('bf')), $4, array[]::text[], array[]::text[], 'Только что', 0, 0)
        returning id
      `,
      [name, login, password, code],
    );

    await client.query(
      `
        update public.invitations
        set is_used = true,
            used_by = $1
        where id = $2
      `,
      [student.rows[0].id, invitation.rows[0].id],
    );

    await client.query("commit");
    return { ok: true, reason: null };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
