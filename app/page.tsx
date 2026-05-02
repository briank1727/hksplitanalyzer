"use client";

import { useState } from "react";
import ComsobPage from "@/components/ComsobPage";

type Tab = "compare" | "analyze";

export default function Home() {
  const [tab, setTab] = useState<Tab>("compare");

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
      active
        ? "border-black text-black dark:border-zinc-50 dark:text-zinc-50"
        : "border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
    }`;

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <header className="flex flex-col items-center justify-center text-center px-8 pt-12 pb-6 gap-4">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-black dark:text-zinc-50">
          DeltaSOB
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
          A speedrunner&apos;s tool for comparing times.
        </p>
      </header>

      <div className="flex justify-center border-b border-black/10 dark:border-white/15 px-8">
        <div className="flex gap-2">
          <button
            type="button"
            className={tabClass(tab === "compare")}
            onClick={() => setTab("compare")}
          >
            Compare to ComSOB
          </button>
          <button
            type="button"
            className={tabClass(tab === "analyze")}
            onClick={() => setTab("analyze")}
          >
            Analyze Livesplit File
          </button>
        </div>
      </div>

      <main className="flex flex-col flex-1 min-h-0">
        <div
          className={`flex flex-col flex-1 min-h-0 ${tab === "compare" ? "" : "hidden"}`}
        >
          <ComsobPage />
        </div>
        <div
          className={`flex flex-col flex-1 min-h-0 ${tab === "analyze" ? "" : "hidden"}`}
        />
      </main>
    </div>
  );
}
