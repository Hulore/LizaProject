export type Subject = {
  slug: "history" | "social-studies";
  shortTitle: string;
  examTitle: string;
};

export type Exam = "oge" | "ege";

export const exams: Record<Exam, { title: string }> = {
  oge: { title: "ОГЭ" },
  ege: { title: "ЕГЭ" },
};

export const subjects: Subject[] = [
  { slug: "history", shortTitle: "История", examTitle: "истории" },
  { slug: "social-studies", shortTitle: "Обществознание", examTitle: "обществознанию" },
];

export function getSubject(slug: Subject["slug"]) {
  return subjects.find((subject) => subject.slug === slug)!;
}
