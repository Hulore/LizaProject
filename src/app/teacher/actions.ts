"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createInvitationForTeacher } from "@/data/invitations";
import { createTeacherSession, getTeacherSession } from "@/lib/auth";
import { copyToHostClipboard } from "@/lib/clipboard";
import { getPostgresPool } from "@/lib/postgres";

export async function changeTeacherPasswordAction(formData: FormData) {
  const session = await getTeacherSession();
  if (!session) redirect("/login");
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmPassword") ?? "");
  if (next.length < 16 || next.length > 128 || next !== confirmation || next === current) {
    redirect("/teacher?password=invalid");
  }
  const result = await getPostgresPool().query(
    `update public.teacher_accounts
     set password_hash=extensions.crypt($1, extensions.gen_salt('bf')),
         session_version=session_version+1
     where login=$2 and password_hash=extensions.crypt($3,password_hash)
     returning id`,
    [next, session.login, current],
  );
  if (!result.rowCount) redirect("/teacher?password=incorrect");
  await createTeacherSession(session.login);
  redirect("/teacher?password=changed");
}

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
