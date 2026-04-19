import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "miniMENTE — AMC Exam Preparation",
    template: "%s | miniMENTE",
  },
  description:
    "AI-powered study platform for AMC MCQ exam preparation. Spaced repetition, intelligent tutoring, and curated medical content.",
  keywords: ["AMC", "Australian Medical Council", "MCQ", "medical exam", "study platform", "spaced repetition"],
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c45c2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-body antialiased`}>
        <MotionConfig
          reducedMotion="user"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
