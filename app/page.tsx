"use client";

import { useState } from "react";
import ComsobPage from "@/app/views/ComsobPage";
import AnalyzeLSSPage from "@/app/views/AnalyzeLSSPage";

type Tab = "compare" | "analyze";

export default function Home() {
  const [tab, setTab] = useState<Tab>("compare");

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-lg font-medium border-b-2 -mb-px transition-colors ${
      active
        ? "border-black text-black dark:border-zinc-50 dark:text-zinc-50"
        : "border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
    }`;

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <header className="flex flex-col items-center justify-center text-center px-4 py-2">
        <img src="/logo.png" alt="DeltaSOB" className="h-auto max-h-64" />
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

      <main className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div
          className={`flex flex-col flex-1 min-h-0 ${tab === "compare" ? "" : "hidden"}`}
        >
          <ComsobPage />
        </div>
        <div
          className={`flex flex-col flex-1 min-h-0 ${tab === "analyze" ? "" : "hidden"}`}
        >
          <AnalyzeLSSPage />
        </div>
      </main>
    </div>
  );
}
