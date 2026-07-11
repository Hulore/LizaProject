import { NextResponse, type NextRequest } from "next/server";
import { createInvitationForTeacher } from "@/data/invitations";
import { getTeacherSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getTeacherSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = await createInvitationForTeacher(session.login);
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const url = `${protocol}://${host}/register/${code}`;

  return NextResponse.json({ code, url });
}
