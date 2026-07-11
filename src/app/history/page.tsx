import type { Metadata } from "next";
import { SubjectPage } from "@/components/subject-page";
import { getSubject } from "@/data/subjects";

export const metadata: Metadata = { title: "ЕГЭ по истории — Сдам", description: "Подготовка к ЕГЭ по истории: теория, темы и практика." };

export default function HistoryPage() {
  return <SubjectPage subject={getSubject("history")} exam="ege" />;
}
