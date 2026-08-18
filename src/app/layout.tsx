import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Texora AI | Professional AI Textile Design Workspace",
  description: "Restore damaged fabric references, extract print motifs, generate repeat patterns, and prepare screen-print color separations in one unified AI-powered workspace.",
  keywords: "textile design, saree design, block printing, screen separation, motif extraction, repeat patterns, AI pattern generator"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${geistSans.className} ${geistMono.variable} min-h-full flex flex-col bg-zinc-950 text-zinc-150 antialiased`}>
        {children}
      </body>
    </html>
  );
}
