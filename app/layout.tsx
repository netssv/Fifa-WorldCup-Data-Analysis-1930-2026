import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Bracket",
  description:
    "Interactive prediction bracket for the FIFA World Cup 2026. Pick your teams through every round — from Groups to the Champion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 dark:bg-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
