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

const REPO_URL = "https://github.com/briank1727/hksplitanalyzer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA;
  const shortSha = commitSha?.slice(0, 7);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${trajanPro.variable} ${perpetua.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        {children}
        {shortSha && shortSha !== "unknown" && (
          <footer className="shrink-0 px-4 py-1 text-center text-xs text-zinc-400 dark:text-zinc-600">
            Built with commit{" "}
            <a
              href={`${REPO_URL}/commit/${commitSha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono underline hover:text-zinc-600 dark:hover:text-zinc-400"
            >
              {shortSha}
            </a>
          </footer>
        )}
        <Analytics />
      </body>
    </html>
  );
}
