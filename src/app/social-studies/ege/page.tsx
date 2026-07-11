import type { Metadata } from "next";
import { SubjectPage } from "@/components/subject-page";
import { getSubject } from "@/data/subjects";

export const metadata: Metadata = { title: "ЕГЭ по обществознанию — Лиза + Вайб" };

export default function SocialStudiesEgePage() {
  return <SubjectPage subject={getSubject("social-studies")} exam="ege" />;
}
