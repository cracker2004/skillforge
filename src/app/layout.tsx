import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "SkillForge — Developer Skills Assessment Platform",
  description:
    "Test, track, and level up your development skills with AI-powered assessments and real-time leaderboards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f0eb" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
