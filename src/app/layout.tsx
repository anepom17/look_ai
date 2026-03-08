import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LookAI — Персональный гид по стилю",
  description:
    "Создайте индивидуальный гайд по стилю: определите цветотип, выберите архетип и получите готовый PDF с рекомендациями по гардеробу.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
