import type { Metadata } from "next";
import { SubjectPage } from "@/components/subject-page";
import { getSubject } from "@/data/subjects";

export const metadata: Metadata = { title: "ОГЭ по истории — Лиза + Вайб" };

export default function HistoryOgePage() {
  return <SubjectPage subject={getSubject("history")} exam="oge" />;
}
