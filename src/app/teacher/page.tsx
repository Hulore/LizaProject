import Link from "next/link";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { TeacherDashboard, type StudentSortKey } from "@/components/teacher-dashboard";
import { getRecentInvitations } from "@/data/invitations";
import { getStudentsForTeacher } from "@/data/students";
import { requireTeacherSession } from "@/lib/auth";
import { logoutAction } from "../login/actions";
import { changeTeacherPasswordAction, createTeacherInvitationAction } from "./actions";

function getSortKey(value: string | undefined): StudentSortKey {
  if (value === "averageScore" || value === "completedTasks") {
    return value;
  }

  return "name";
}

export default async function TeacherPage({
  searchParams,
}: {
  searchParams?: Promise<{ copied?: string; invite?: string; q?: string; sort?: string; password?: string }>;
}) {
  await requireTeacherSession();
  const params = await searchParams;
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const createdInviteUrl = params?.invite ? `${protocol}://${host}/register/${params.invite}` : undefined;
  const query = String(params?.q ?? "").trim();
  const sortKey = getSortKey(params?.sort);
  const students = await getStudentsForTeacher();
  const invitations = await getRecentInvitations();

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <SiteHeader />

      <main className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="teacher-page-actions">
          <Link href="/" className="back-link">
            На главную
          </Link>
          <Link href="/teacher/tasks" className="back-link">Управление заданиями</Link>
          <form action={logoutAction}>
            <button type="submit" className="back-link">
              Выйти
            </button>
          </form>
        </div>
        <TeacherDashboard
          copiedInvite={params?.copied === "1"}
          createInvitationAction={createTeacherInvitationAction}
          createdInviteCode={params?.invite}
          createdInviteUrl={createdInviteUrl}
          invitations={invitations}
          query={query}
          sortKey={sortKey}
          students={students}
        />
        <details className="mt-8 border border-gray-300 p-5">
          <summary className="cursor-pointer">Сменить пароль учителя</summary>
          <form action={changeTeacherPasswordAction} className="auth-form mt-5">
            <label>Текущий пароль<input name="currentPassword" type="password" autoComplete="current-password" required /></label>
            <label>Новый пароль (не менее 16 символов)<input name="newPassword" type="password" autoComplete="new-password" minLength={16} required /></label>
            <label>Повтори новый пароль<input name="confirmPassword" type="password" autoComplete="new-password" minLength={16} required /></label>
            <button type="submit">Сменить пароль</button>
          </form>
          {params?.password === "changed" && <p>Пароль изменён. Старые входы учителя отключены.</p>}
          {params?.password === "incorrect" && <p>Текущий пароль неверный.</p>}
          {params?.password === "invalid" && <p>Проверь новый пароль и его повтор.</p>}
        </details>
      </main>
    </div>
  );
}
