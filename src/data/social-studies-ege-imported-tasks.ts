import importedTasks from "./social-studies-ege-imported-tasks.json";
import importedMeta from "./social-studies-ege-imported-meta.json";

export type EgeImportedSocialStudiesTask = {
  id: string;
  subject: "social_studies";
  exam: "ege";
  part: 1;
  number: number;
  sourceId: string;
  topic: string;
  taskKind: "ege_imported_text_answer";
  taskKindLabel: string;
  title: string;
  question: string;
  prompt: string;
  answer: { value: string[]; orderMatters: true };
  explanation: string;
  source: { name: string; sourceId: string; file: string };
};

export const egeImportedSocialStudiesTasks = importedTasks as EgeImportedSocialStudiesTask[];
export const egeImportedSocialStudiesMeta = importedMeta;
export const egeImportedSocialStudiesTopics = importedMeta.topics;
export const egeImportedSocialStudiesNumbers = importedMeta.numbers;
