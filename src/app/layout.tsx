import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { metaCopy } from "@/lib/copy";
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
    default: metaCopy.siteTitle.en,
    template: "%s | miniMENTE",
  },
  description: metaCopy.siteDesc.en,
  keywords: metaCopy.keywords,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: metaCopy.siteTitle.en,
    description: metaCopy.siteDesc.en,
    type: "website",
    locale: "en_AU",
    alternateLocale: "pt_BR",
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
