import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["cyrillic", "latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  title: "Лиза ЖЁСТКИЕЙ ТРЕНЖЁР + Вайб",
  description: "Подготовка к ОГЭ и ЕГЭ по истории и обществознанию без духоты.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
