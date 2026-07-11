import type { Metadata } from "next";
import { SubjectPage } from "@/components/subject-page";
import { getSubject } from "@/data/subjects";

export const metadata: Metadata = { title: "ЕГЭ по истории — Лиза + Вайб" };

export default function HistoryEgePage() {
  return <SubjectPage subject={getSubject("history")} exam="ege" />;
}
