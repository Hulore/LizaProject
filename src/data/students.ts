import { createSupabaseServerClient } from "@/lib/supabase";

export type Student = {
  id: number;
  name: string;
  login: string;
  password: string;
  inviteCode: string;
  subjects: string[];
  exams: string[];
  lastActivity: string;
  completedTasks: number;
  averageScore: number;
};

export const teacherAccount = {
  login: "TestTeacher",
  password: "123321",
};

export const students: Student[] = [
  {
    id: 1,
    name: "Алина Морозова",
    login: "student_alina",
    password: "Q7v!2mZp#19a",
    inviteCode: "LZ-8K2P-MR91",
    subjects: ["История", "Обществознание"],
    exams: ["ЕГЭ"],
    lastActivity: "Сегодня",
    completedTasks: 42,
    averageScore: 78,
  },
  {
    id: 2,
    name: "Матвей Орлов",
    login: "student_matvey",
    password: "N4r$8xTc@52q",
    inviteCode: "LZ-3Q7N-OL44",
    subjects: ["История"],
    exams: ["ОГЭ"],
    lastActivity: "Вчера",
    completedTasks: 18,
    averageScore: 64,
  },
  {
    id: 3,
    name: "София Белова",
    login: "student_sofia",
    password: "H9p&6dVy!03s",
    inviteCode: "LZ-6B1S-BL28",
    subjects: ["Обществознание"],
    exams: ["ЕГЭ"],
    lastActivity: "2 дня назад",
    completedTasks: 35,
    averageScore: 82,
  },
  {
    id: 4,
    name: "Иван Соколов",
    login: "student_ivan",
    password: "R2k#9wLp$74f",
    inviteCode: "LZ-5V8D-SK63",
    subjects: ["История", "Обществознание"],
    exams: ["ОГЭ", "ЕГЭ"],
    lastActivity: "Сегодня",
    completedTasks: 51,
    averageScore: 71,
  },
  {
    id: 5,
    name: "Ева Кузнецова",
    login: "student_eva",
    password: "T8z!1qMa#66u",
    inviteCode: "LZ-2C4E-KZ10",
    subjects: ["Обществознание"],
    exams: ["ОГЭ"],
    lastActivity: "5 дней назад",
    completedTasks: 11,
    averageScore: 58,
  },
  {
    id: 6,
    name: "Даниил Волков",
    login: "student_daniil",
    password: "M6y$3hXn@81p",
    inviteCode: "LZ-9H5W-VK37",
    subjects: ["История"],
    exams: ["ЕГЭ"],
    lastActivity: "Сегодня",
    completedTasks: 27,
    averageScore: 69,
  },
  {
    id: 7,
    name: "Мария Федорова",
    login: "student_maria",
    password: "P1s&7jRb!48k",
    inviteCode: "LZ-1F6M-FD82",
    subjects: ["История", "Обществознание"],
    exams: ["ЕГЭ"],
    lastActivity: "3 дня назад",
    completedTasks: 63,
    averageScore: 87,
  },
  {
    id: 8,
    name: "Артем Новиков",
    login: "student_artem",
    password: "V5c#0nGt$25e",
    inviteCode: "LZ-7A3T-NV55",
    subjects: ["Обществознание"],
    exams: ["ЕГЭ"],
    lastActivity: "Неделю назад",
    completedTasks: 9,
    averageScore: 49,
  },
];

type SupabaseStudent = {
  id: number;
  name: string;
  login: string;
  invite_code: string;
  subjects: string[] | null;
  exams: string[] | null;
  last_activity: string | null;
  completed_tasks: number | null;
  average_score: number | null;
};

export async function getStudentsForTeacher(): Promise<Student[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return students;
  }

  const { data, error } = await supabase
    .from("students")
    .select("id, name, login, invite_code, subjects, exams, last_activity, completed_tasks, average_score")
    .order("name", { ascending: true });

  if (error || !data) {
    return students;
  }

  return (data as SupabaseStudent[]).map((student) => ({
    id: student.id,
    name: student.name,
    login: student.login,
    password: "stored-in-supabase",
    inviteCode: student.invite_code,
    subjects: student.subjects ?? [],
    exams: student.exams ?? [],
    lastActivity: student.last_activity ?? "Еще не заходил",
    completedTasks: student.completed_tasks ?? 0,
    averageScore: student.average_score ?? 0,
  }));
}
