import { NextResponse } from "next/server";
import {
  egeImportedSocialStudiesNumbers,
  egeImportedSocialStudiesTasks,
  type EgeImportedSocialStudiesTask,
} from "@/data/social-studies-ege-imported-tasks";

export const dynamic = "force-dynamic";

function shuffleTasks<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getLimitedTasks(tasks: EgeImportedSocialStudiesTask[], count: number) {
  return shuffleTasks(tasks).slice(0, Math.max(1, Math.min(count, tasks.length)));
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const count = Number(searchParams.get("count") ?? "3");

  if (mode === "topic") {
    const topic = searchParams.get("topic") ?? "";
    const tasks = egeImportedSocialStudiesTasks.filter((task) => task.topic === topic);

    return NextResponse.json({ tasks: getLimitedTasks(tasks, count) });
  }

  if (mode === "number") {
    const number = Number(searchParams.get("number"));
    const tasks = egeImportedSocialStudiesTasks.filter((task) => task.number === number);

    return NextResponse.json({ tasks: getLimitedTasks(tasks, count) });
  }

  if (mode === "variant") {
    const tasks = egeImportedSocialStudiesNumbers
      .map((number) => shuffleTasks(egeImportedSocialStudiesTasks.filter((task) => task.number === number))[0])
      .filter(Boolean);

    return NextResponse.json({ tasks });
  }

  return NextResponse.json({ tasks: [] });
}
