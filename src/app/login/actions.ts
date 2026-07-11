"use server";

import { redirect } from "next/navigation";
import { clearSession, createTeacherSession, verifyTeacherCredentials } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const login = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!login || !password) {
    redirect("/login?error=empty");
  }

  const isTeacher = await verifyTeacherCredentials(login, password);

  if (!isTeacher) {
    redirect("/login?error=invalid");
  }

  await createTeacherSession(login);
  redirect("/teacher");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
