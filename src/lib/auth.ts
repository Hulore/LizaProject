import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPostgresPool } from "@/lib/postgres";

import { decodeSession, encodeSession, isSecureSessionHost, sessionCookieName, sessionTtlSeconds, type UserSession } from "@/lib/session";

async function shouldSecureSessionCookie() {
  const requestHeaders = await headers();
  return isSecureSessionHost(requestHeaders.get("host") ?? "");
}

export async function verifyTeacherCredentials(login: string, password: string) {
  const result = await getPostgresPool().query<{ valid: boolean }>(
    "select public.verify_teacher_login($1, $2) as valid",
    [login, password],
  );
  return result.rows[0]?.valid === true;
}

export async function verifyStudentCredentials(login: string, password: string) {
  const pool = getPostgresPool();
  const result = await pool.query<{ name: string }>(
    `
      select name
      from public.students
      where login = $1
        and password_hash = extensions.crypt($2, password_hash)
      limit 1
    `,
    [login, password],
  );

  const student = result.rows[0];

  if (!student) {
    return null;
  }

  return { login, name: student.name };
}

export async function createSession({ login, name, role, version }: Pick<UserSession, "login" | "name" | "role" | "version">) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, encodeSession({ role, login, name, version }), {
    httpOnly: true,
    sameSite: "lax",
    secure: await shouldSecureSessionCookie(),
    path: "/",
    maxAge: sessionTtlSeconds,
  });
}

export async function createTeacherSession(login: string) {
  const result = await getPostgresPool().query<{ session_version: number }>(
    "select session_version from public.teacher_accounts where login=$1", [login],
  );
  if (!result.rows[0]) throw new Error("Teacher account not found.");
  await createSession({ role: "teacher", login, name: login, version: result.rows[0].session_version });
}

export async function createStudentSession(login: string, name: string) {
  await createSession({ role: "student", login, name });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: await shouldSecureSessionCookie(),
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(sessionCookieName)?.value;
  const session = decodeSession(rawSession);
  if (session?.role !== "teacher") return session;
  const result = await getPostgresPool().query<{ session_version: number }>(
    "select session_version from public.teacher_accounts where login=$1", [session.login],
  );
  return result.rows[0]?.session_version === session.version ? session : null;
}

export async function getTeacherSession() {
  const session = await getSession();

  if (session?.role !== "teacher") {
    return null;
  }

  return session;
}

export async function requireTeacherSession() {
  const session = await getTeacherSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
