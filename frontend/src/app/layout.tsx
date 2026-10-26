import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "student-feedback-analyzer",
  description: "student-feedback-analyzer: analyze student feedback with sentiment classification, aspect signals, and actionable reports.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><Shell>{children}</Shell></body></html>;
}
