import { createHmac, timingSafeEqual } from "crypto";

export const sessionCookieName = "liza_session";
export const sessionTtlSeconds = 60 * 60 * 24 * 400;

export type UserSession = {
  role: "teacher" | "student";
  login: string;
  name?: string;
  version?: number;
  exp: number;
};

function signPayload(payload: string) {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error("AUTH_SESSION_SECRET is not configured.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function encodeSession(session: Omit<UserSession, "exp">) {
  const payload = Buffer.from(JSON.stringify({
    ...session,
    exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds,
  })).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

export function decodeSession(rawSession?: string): UserSession | null {
  if (!rawSession) return null;
  const parts = rawSession.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = Buffer.from(signPayload(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as UserSession;
    if (!["teacher", "student"].includes(session.role) ||
      typeof session.login !== "string" || !session.login ||
      !Number.isFinite(session.exp) || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function isSecureSessionHost(host: string) {
  const hostname = host.split(":")[0];
  const localHost = hostname === "localhost" || hostname === "127.0.0.1" ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);
  return process.env.NODE_ENV === "production" && !localHost;
}
