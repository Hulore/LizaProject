import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { TaskManager } from "@/components/task-manager";
import { requireTeacherSession } from "@/lib/auth";

export default async function TeacherTasksPage() {
  await requireTeacherSession();
  return <><SiteHeader /><main className="task-manager"><Link href="/teacher" className="back-link">← Кабинет учителя</Link><h1>Управление заданиями</h1><TaskManager /></main></>;
}
