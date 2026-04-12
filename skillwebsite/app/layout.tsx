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
  title: {
    default: "Skill Link — Freelance marketplace",
    template: "%s | Skill Link",
  },
  description:
    "Connect skilled professionals with hiring partners. Post jobs, showcase portfolios, message, and grow — the Skill Link freelance marketplace.",
  openGraph: {
    title: "Skill Link — Freelance marketplace",
    description:
      "Hire skilled people. Earn as a freelancer. Jobs, portfolios, and real-time collaboration.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Link — Freelance marketplace",
    description:
      "Hire skilled people. Earn as a freelancer. Jobs, portfolios, and real-time collaboration.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
