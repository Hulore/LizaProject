import "server-only";
import { getPostgresPool } from "@/lib/postgres";

export type Student = {
  id: number;
  name: string;
  login: string;
  inviteCode: string;
  subjects: string[];
  exams: string[];
  lastActivity: string;
  completedTasks: number;
  averageScore: number;
};

type StudentRow = {
  id: number;
  name: string;
  login: string;
  invite_code: string;
  subjects: string[];
  exams: string[];
  last_activity: string;
  completed_tasks: number;
  average_score: number;
};

export async function getStudentsForTeacher(): Promise<Student[]> {
  const result = await getPostgresPool().query<StudentRow>(
    `select id, name, login, invite_code, subjects, exams, last_activity, completed_tasks, average_score
     from public.students order by name`,
  );
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    login: row.login,
    inviteCode: row.invite_code,
    subjects: row.subjects ?? [],
    exams: row.exams ?? [],
    lastActivity: row.last_activity ?? "Еще не заходил",
    completedTasks: row.completed_tasks ?? 0,
    averageScore: row.average_score ?? 0,
  }));
}
