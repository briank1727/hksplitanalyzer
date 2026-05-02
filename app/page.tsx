"use client";

import { useState } from "react";
import Button from "@/components/Button";
import TimelinePanel from "@/components/TimelinePanel";
import DiffSplitView from "@/components/DiffSplitView";
import HelpPanel from "@/components/HelpPanel";
import type { LiveSplit } from "@/lib/lss_logic";

type View = "compare" | "diff";

export default function Home() {
  const [timeline1, setTimeline1] = useState<LiveSplit | null>(null);
  const [timeline2, setTimeline2] = useState<LiveSplit | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [view, setView] = useState<View>("compare");
  const [resetKey, setResetKey] = useState(0);

  const compareDisabledReason =
    !timeline1 || !timeline2
      ? "Generate or load both timelines first"
      : timeline1.segments.length !== timeline2.segments.length
        ? `Timelines have different numbers of splits (${timeline1.segments.length} vs ${timeline2.segments.length})`
        : undefined;
  const canCompare = compareDisabledReason === undefined;

  const handleReset = () => {
    setTimeline1(null);
    setTimeline2(null);
    setResetKey((k) => k + 1);
  };

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

      {view === "compare" ? (
        <>
          <header className="flex flex-col items-center justify-center text-center px-8 pt-12 pb-6 gap-4">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-black dark:text-zinc-50">
              DeltaSOB
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
              A speedrunner&apos;s tool for comparing times.
            </p>
            <div className="flex items-center gap-3">
              <span title={compareDisabledReason}>
                <Button
                  size="lg"
                  variant="success"
                  disabled={!canCompare}
                  onClick={() => setView("diff")}
                >
                  Compare
                </Button>
              </span>
              <Button size="lg" variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </header>
          <main className="flex flex-row flex-1 px-8 pb-12 gap-4">
            <section className="flex-1 p-4 border-r border-black/10 dark:border-white/15">
              <TimelinePanel
                key={`t1-${resetKey}`}
                title="Timeline 1"
                generated={timeline1}
                setGenerated={setTimeline1}
              />
            </section>
            <section className="flex-1 p-4">
              <TimelinePanel
                key={`t2-${resetKey}`}
                title="Timeline 2"
                generated={timeline2}
                setGenerated={setTimeline2}
              />
            </section>
          </main>
        </>
      ) : (
        <>
          <header className="flex items-center gap-4 px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/15">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setView("compare")}
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              DeltaSOB
            </h1>
          </header>
          <main className="flex-1 px-8 py-6">
            {timeline1 && timeline2 ? (
              <DiffSplitView timeline1={timeline1} timeline2={timeline2} />
            ) : null}
          </main>
        </>
      )}
    </div>
  );
}
