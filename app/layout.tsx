import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const trajanPro = localFont({
  src: [
    {
      path: "../public/TrajanPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-trajan",
});

const perpetua = localFont({
  src: [
    {
      path: "../public/Perpetua-Bold.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-perpetua",
});

export const metadata: Metadata = {
  title: "Hollow Knight Split Analyzer",
  description: "A hollow knight speedrunner's tool for comparing times.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${trajanPro.variable} ${perpetua.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
