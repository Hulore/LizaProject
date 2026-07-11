import Link from "next/link";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { TeacherDashboard } from "@/components/teacher-dashboard";
import { getRecentInvitations } from "@/data/invitations";
import { getStudentsForTeacher } from "@/data/students";
import { requireTeacherSession } from "@/lib/auth";
import { logoutAction } from "../login/actions";
import { createTeacherInvitationAction } from "./actions";

export default async function TeacherPage({
  searchParams,
}: {
  searchParams?: Promise<{ copied?: string; invite?: string }>;
}) {
  await requireTeacherSession();
  const params = await searchParams;
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const createdInviteUrl = params?.invite ? `${protocol}://${host}/register/${params.invite}` : undefined;
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
          students={students}
        />
      </main>
    </div>
  );
}
