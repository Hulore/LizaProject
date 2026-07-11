"use server";

import { redirect } from "next/navigation";
import { registerStudentByInvitation } from "@/data/invitations";

export async function registerStudentAction(code: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const login = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !login || !password) {
    redirect(`/register/${encodeURIComponent(code)}?error=empty`);
  }

  if (password.length < 6) {
    redirect(`/register/${encodeURIComponent(code)}?error=password`);
  }

  const result = await registerStudentByInvitation({ code, name, login, password });

  if (!result.ok) {
    redirect(`/register/${encodeURIComponent(code)}?error=${result.reason}`);
  }

  redirect("/login?registered=student");
}
