import type { Metadata } from "next";
import { SubjectPage } from "@/components/subject-page";
import { getSubject } from "@/data/subjects";

export const metadata: Metadata = { title: "ОГЭ по обществознанию — Лиза + Вайб" };

export default function SocialStudiesOgePage() {
  return <SubjectPage subject={getSubject("social-studies")} exam="oge" />;
}
