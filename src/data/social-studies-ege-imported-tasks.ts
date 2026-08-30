import importedTasks from "./social-studies-ege-imported-tasks.json";

export type EgeImportedSocialStudiesTask = {
  id: string;
  subject: "social_studies";
  exam: "ege";
  part: 1 | 2;
  number: number;
  sourceId: string;
  topic: string;
  taskKind: "ege_imported_text_answer" | "ege_imported_free_answer";
  taskKindLabel: string;
  title: string;
  question: string;
  prompt: string;
  images?: string[];
  answer: { value: string[]; orderMatters: true; autoCheck: boolean };
  explanation: string;
  source: { name: string; sourceId: string; file: string };
};

export const egeImportedSocialStudiesTasks = importedTasks as EgeImportedSocialStudiesTask[];
