"use client";

import { useState } from "react";
import TimelinePanel from "@/components/TimelinePanel";
import DiffSplitView from "@/components/DiffSplitView";
import HelpPanel from "@/components/HelpPanel";
import type { LiveSplit } from "@/lib/lss_logic";

export default function Home() {
  const [timeline1, setTimeline1] = useState<LiveSplit | null>(null);
  const [timeline2, setTimeline2] = useState<LiveSplit | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <button
        type="button"
        aria-label="Help"
        onClick={() => setHelpOpen(true)}
        className="fixed top-4 right-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black backdrop-blur hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:border-white/15 dark:bg-black/60 dark:text-zinc-50 dark:hover:bg-white/10 dark:focus-visible:ring-white/40"
      >
        <span className="text-lg font-semibold">?</span>
      </button>
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
      <header className="flex flex-col items-center justify-center text-center basis-1/3 px-8 pt-12">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-black dark:text-zinc-50">
          DeltaSOB
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
          A speedrunner&apos;s tool for comparing times.
        </p>
      </header>
      <main className="flex flex-row basis-2/3 px-8 pb-12 gap-4">
        <section className="flex-1 p-4 border-r border-black/10 dark:border-white/15">
          <TimelinePanel
            title="Timeline 1"
            generated={timeline1}
            setGenerated={setTimeline1}
          />
        </section>
        <section className="flex-1 p-4 border-r border-black/10 dark:border-white/15">
          <TimelinePanel
            title="Timeline 2"
            generated={timeline2}
            setGenerated={setTimeline2}
          />
        </section>
        <section className="flex-1 p-4">
          <DiffSplitView timeline1={timeline1} timeline2={timeline2} />
        </section>
      </main>
    </div>
  );
}
