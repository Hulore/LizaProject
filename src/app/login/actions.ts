"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  createStudentSession,
  createTeacherSession,
  verifyStudentCredentials,
  verifyTeacherCredentials,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const login = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "student");

  if (!login || !password) {
    redirect("/login?error=empty");
  }

  if (role === "teacher") {
    const isTeacher = await verifyTeacherCredentials(login, password);

    if (!isTeacher) {
      redirect("/login?error=invalid");
    }

    await createTeacherSession(login);
    redirect("/teacher");
  }

  const student = await verifyStudentCredentials(login, password);

  if (!student) {
    redirect("/login?error=invalid");
  }

  await createStudentSession(student.login, student.name);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
