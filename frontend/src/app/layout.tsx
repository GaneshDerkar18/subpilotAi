import "./globals.css"; // <--- MUST BE AT THE VERY TOP
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SubPilot AI",
  description: "Autonomous Financial Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}