import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPostgresPool } from "@/lib/postgres";
import { createSupabaseServerClient } from "@/lib/supabase";

const sessionCookieName = "liza_session";
const sessionTtlSeconds = 60 * 60 * 8;

type UserSession = {
  role: "teacher" | "student";
  login: string;
  name?: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured.");
  }

  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

export async function verifyTeacherCredentials(login: string, password: string) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase.rpc("verify_teacher_login", {
    input_login: login,
    input_password: password,
  });

  if (error) {
    return false;
  }

  return data === true;
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

export async function createSession({ login, name, role }: Pick<UserSession, "login" | "name" | "role">) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionTtlSeconds;
  const payload = toBase64Url(JSON.stringify({ role, login, name, exp: expiresAt } satisfies UserSession));
  const signature = signPayload(payload);
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionTtlSeconds,
  });
}

export async function createTeacherSession(login: string) {
  await createSession({ role: "teacher", login, name: login });
}

export async function createStudentSession(login: string, name: string) {
  await createSession({ role: "student", login, name });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(sessionCookieName)?.value;

  if (!rawSession) {
    return null;
  }

  const [payload, signature] = rawSession.split(".");

  if (!payload || !signature || !safeEqual(signPayload(payload), signature)) {
    return null;
  }

  try {
    const session = JSON.parse(fromBase64Url(payload)) as UserSession;

    if (!["teacher", "student"].includes(session.role) || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
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
