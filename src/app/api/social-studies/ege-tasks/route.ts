import { NextResponse } from "next/server";
import { getPublishedTasks } from "@/lib/task-bank";
import { hasTaskSubtopic } from "@/lib/task-taxonomy";
import {
  type EgeImportedSocialStudiesTask,
} from "@/data/social-studies-ege-imported-tasks";

export const dynamic = "force-dynamic";

function shuffleTasks<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getLimitedTasks(tasks: EgeImportedSocialStudiesTask[], count: number) {
  return shuffleTasks(tasks).slice(0, Math.max(1, Math.min(count, tasks.length)));
}

export async function GET(request: Request) {
  const egeImportedSocialStudiesTasks = (await getPublishedTasks()).filter((task): task is EgeImportedSocialStudiesTask => task.exam === "ege");
  const egeImportedSocialStudiesNumbers = Array.from({length:25},(_,i)=>i+1);
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const requestedCount = Number(searchParams.get("count") ?? "3");
  const count = Number.isFinite(requestedCount) ? Math.max(1,Math.min(100,Math.floor(requestedCount))) : 3;

  if (mode === "topic") {
    const topic = searchParams.get("topic") ?? "";
    const subtopic = searchParams.get('subtopic');
    const tasks = egeImportedSocialStudiesTasks.filter((task) => task.topic === topic && (subtopic===null || hasTaskSubtopic(task,subtopic)));

    return NextResponse.json({ tasks: getLimitedTasks(tasks, count) });
  }

  if (mode === "number") {
    const number = Number(searchParams.get("number"));
    const tasks = egeImportedSocialStudiesTasks.filter((task) => task.number === number);

    return NextResponse.json({ tasks: getLimitedTasks(tasks, count) });
  }

  if (mode === "variant") {
    const testOnly = searchParams.get('part') === '1';
    const requiredNumbers = testOnly ? egeImportedSocialStudiesNumbers.slice(0,16) : egeImportedSocialStudiesNumbers;
    const tasks = requiredNumbers
      .map((number) => shuffleTasks(egeImportedSocialStudiesTasks.filter((task) => task.number === number && (!testOnly || task.part===1)))[0])
      .filter(Boolean);

    if (tasks.length !== requiredNumbers.length) return NextResponse.json({error:`Для варианта нужны опубликованные задания каждого номера с 1 по ${testOnly ? 16 : 25}.`},{status:422});

    return NextResponse.json({ tasks });
  }

  return NextResponse.json({ tasks: [] });
}
