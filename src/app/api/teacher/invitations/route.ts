import { NextResponse, type NextRequest } from "next/server";
import { createInvitationForTeacher, isInviteCode } from "@/data/invitations";
import { getTeacherSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getTeacherSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { code?: string };
  const requestedCode = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";

  if (requestedCode && !isInviteCode(requestedCode)) {
    return NextResponse.json({ error: "Invalid invitation code" }, { status: 400 });
  }

  const code = await createInvitationForTeacher(session.login, requestedCode || undefined);
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const url = `${protocol}://${host}/register/${code}`;

  return NextResponse.json({ code, url });
}
