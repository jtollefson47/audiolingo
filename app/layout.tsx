import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Audiolingo",
    template: "%s | Audiolingo",
  },
  description:
    "Duolingo-meets-Sound-Gym audio engineering and music education — learn compressors, EQs, ear training, and more through games.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}