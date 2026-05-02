"use client";

import { useState } from "react";
import Button from "@/components/Button";
import ComsobImporterView from "@/app/views/ComsobImporterView";
import DiffSplitView from "@/app/views/DiffSplitView";
import LiveSplitImporter from "@/app/views/LiveSplitImporterView";
import type { LiveSplit } from "@/lib/lss_logic";

export default function ComsobPage() {
  const [timeline, setTimeline] = useState<LiveSplit | null>(null);
  const [comsob, setComsob] = useState<LiveSplit | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const compareDisabledReason =
    !timeline || !comsob ? "Generate both timelines first" : undefined;
  const canCompare = compareDisabledReason === undefined;

  if (showDiff && timeline && comsob) {
    return (
      <div className="flex flex-col gap-4 pt-4 px-4">
        <div className="flex justify-center">
          <Button size="sm" onClick={() => setShowDiff(false)}>
            ← Back
          </Button>
        </div>
        <DiffSplitView timeline1={timeline} timeline2={comsob} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4 px-4">
      <div className="flex justify-center">
        <span title={compareDisabledReason}>
          <Button
            size="lg"
            variant="success"
            disabled={!canCompare}
            onClick={() => setShowDiff(true)}
            className="text-2xl"
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
          <ComsobImporterView
            title="Comsob"
            generated={comsob}
            setGenerated={setComsob}
          />
        </section>
      </div>
    </div>
  );
}
