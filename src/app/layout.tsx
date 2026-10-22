import type { Metadata } from "next";
import { Inter, Schibsted_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { EmojiPolyfill } from "@/components/shared/emoji-polyfill";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediSync — Clinic Management System",
  description: "Manage clinics, doctors, patients, and appointments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${schibsted.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <EmojiPolyfill />
        {children}
      </body>
    </html>
  );
}
