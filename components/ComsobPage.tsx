"use client";

import { useState } from "react";
import Button from "@/components/Button";
import ComsobImporter from "@/components/ComsobImporter";
import DiffSplitView from "@/components/DiffSplitView";
import LiveSplitImporter from "@/components/LiveSplitImporter";
import type { LiveSplit } from "@/lib/lss_logic";

export default function ComsobPage() {
  const [timeline, setTimeline] = useState<LiveSplit | null>(null);
  const [comsob, setComsob] = useState<LiveSplit | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const compareDisabledReason =
    !timeline || !comsob
      ? "Generate both timelines first"
      : timeline.segments.length !== comsob.segments.length
        ? `Timelines have different numbers of splits (${timeline.segments.length} vs ${comsob.segments.length})`
        : undefined;
  const canCompare = compareDisabledReason === undefined;

  if (showDiff && timeline && comsob) {
    return (
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="flex flex-col gap-4 pt-4 px-4">
            <div className="flex justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowDiff(false)}
              >
                ← Back
              </Button>
            </div>
            <DiffSplitView timeline1={timeline} timeline2={comsob} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex flex-col gap-4 pt-4 px-4">
          <div className="flex justify-center">
            <span title={compareDisabledReason}>
              <Button
                size="sm"
                variant="success"
                disabled={!canCompare}
                onClick={() => setShowDiff(true)}
              >
                Compare
              </Button>
            </span>
          </div>
          <div className="flex flex-row">
            <section className="flex-1 p-4 border-r border-black/10 dark:border-white/15">
              <LiveSplitImporter
                title="Your Run"
                generated={timeline}
                setGenerated={setTimeline}
              />
            </section>
            <section className="flex-1 p-4">
              <ComsobImporter
                title="Comsob"
                generated={comsob}
                setGenerated={setComsob}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
