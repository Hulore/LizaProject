import type { Metadata } from "next";
import { SubjectPage } from "@/components/subject-page";
import { getSubject } from "@/data/subjects";

export const metadata: Metadata = { title: "ЕГЭ по обществознанию — Сдам", description: "Подготовка к ЕГЭ по обществознанию: теория, темы и практика." };

export default function SocialStudiesPage() {
  return <SubjectPage subject={getSubject("social-studies")} exam="ege" />;
}
