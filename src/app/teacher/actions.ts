"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createInvitationForTeacher } from "@/data/invitations";
import { getTeacherSession } from "@/lib/auth";
import { copyToHostClipboard } from "@/lib/clipboard";

export async function createTeacherInvitationAction() {
  const session = await getTeacherSession();

  if (!session) {
    redirect("/login");
  }

  const code = await createInvitationForTeacher(session.login);
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const inviteUrl = `${protocol}://${host}/register/${code}`;
  const copied = copyToHostClipboard(inviteUrl);

  redirect(`/teacher?invite=${code}&copied=${copied ? "1" : "0"}`);
}
