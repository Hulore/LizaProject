import "server-only";
import { egeImportedSocialStudiesTasks, type EgeImportedSocialStudiesTask } from "@/data/social-studies-ege-imported-tasks";
import { ogeSocialStudiesTasks, type OgeSocialStudiesTask } from "@/data/social-studies-oge-tasks";
import { getPostgresPool } from "@/lib/postgres";
import { egeImportedSocialStudiesMeta } from "@/data/social-studies-ege-imported-meta";
import { getTaskSubtopic, compareSubtopics } from "@/lib/task-taxonomy";

export type ManagedTask = EgeImportedSocialStudiesTask | OgeSocialStudiesTask;
export type TaskStatus = "published" | "draft" | "archived";
export type TaskRecord = { task: ManagedTask; status: TaskStatus; revision: number };

export async function getTaskRecords(): Promise<TaskRecord[]> {
  const overrides = await getPostgresPool().query<{ id: string; data: ManagedTask; status: TaskStatus; revision: number }>(
    "select id, data, status, revision from public.task_overrides",
  );
  const records = new Map<string, TaskRecord>(
    [...egeImportedSocialStudiesTasks, ...ogeSocialStudiesTasks].map(task => [task.id, { task, status: "published", revision: 0 }]),
  );
  for (const row of overrides.rows) records.set(row.id, { task: row.data, status: row.status, revision: row.revision });
  return [...records.values()].map(record=>({...record,task:{...record.task,subtopic:getTaskSubtopic(record.task)}}));
}

export async function getPublishedTasks() {
  return (await getTaskRecords()).filter(record => record.status === "published").map(record => record.task);
}

export function getTaskMeta(tasks: EgeImportedSocialStudiesTask[]) {
  const countsByNumber: Record<string, number> = {};
  const countsByTopic: Record<string, number> = {};
  const countsByNumberAndKind: Record<string, Record<string, number>> = {};
  const titlesByNumber: Record<string, string> = {};
  const countsBySubtopic: Record<string,number> = {};
  const subtopicsByTopic: Record<string,string[]> = {};
  const countsByTopicAndSubtopic: Record<string,Record<string,number>> = {};
  for (const task of tasks) {
    countsByNumber[task.number] = (countsByNumber[task.number] ?? 0) + 1;
    countsByTopic[task.topic] = (countsByTopic[task.topic] ?? 0) + 1;
    const kinds = countsByNumberAndKind[task.number] ??= {};
    kinds[task.taskKindLabel] = (kinds[task.taskKindLabel] ?? 0) + 1;
    titlesByNumber[task.number] ??= (egeImportedSocialStudiesMeta.titlesByNumber as Record<string,string>)[task.number] ?? task.topic;
    const subtopic = getTaskSubtopic(task);
    countsBySubtopic[subtopic] = (countsBySubtopic[subtopic] ?? 0) + 1;
    const list = subtopicsByTopic[task.topic] ??= [];
    if (!list.includes(subtopic)) list.push(subtopic);
    const topicCounts = countsByTopicAndSubtopic[task.topic] ??= {};
    topicCounts[subtopic] = (topicCounts[subtopic] ?? 0)+1;
  }
  for (const list of Object.values(subtopicsByTopic)) list.sort(compareSubtopics);
  return { total: tasks.length, topics: Object.keys(countsByTopic).sort(), numbers: Object.keys(countsByNumber).map(Number).sort((a,b)=>a-b), countsByNumber, countsByTopic, countsByNumberAndKind, titlesByNumber, countsBySubtopic, subtopicsByTopic, countsByTopicAndSubtopic };
}
