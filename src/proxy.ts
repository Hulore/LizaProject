import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, encodeSession, isSecureSessionHost, sessionCookieName, sessionTtlSeconds } from "@/lib/session";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  // Refresh on page visits only; a logout POST must not recreate the cookie.
  if (request.method !== "GET") return response;
  const session = decodeSession(request.cookies.get(sessionCookieName)?.value);
  if (session && session.exp - Math.floor(Date.now() / 1000) < sessionTtlSeconds - 86400) {
    response.cookies.set(sessionCookieName, encodeSession(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureSessionHost(request.headers.get("host") ?? ""),
      path: "/",
      maxAge: sessionTtlSeconds,
    });
  }
  return response;
}

export const config = {
  matcher: ["/", "/login", "/teacher/:path*", "/social-studies/:path*", "/history/:path*", "/register/:path*"],
};
