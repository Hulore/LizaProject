"use server";

import { redirect } from "next/navigation";
import { createInvitationForTeacher } from "@/data/invitations";
import { requireTeacherSession } from "@/lib/auth";

export async function createInvitationAction() {
  const session = await requireTeacherSession();
  const code = await createInvitationForTeacher(session.login);

  redirect(`/teacher?invite=${encodeURIComponent(code)}`);
}
