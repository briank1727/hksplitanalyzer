"use client";

import { useState } from "react";
import Button from "@/components/Button";
import ComsobImporterView from "@/views/ComsobImporterView";
import DiffSplitView from "@/views/DiffSplitView";
import LiveSplitImporter from "@/views/LiveSplitImporterView";
import { Timeline } from "@/lib/timeline";

export default function ComsobPage() {
  const [userTimeline, setUserTimeline] = useState<Timeline | null>(null);
  const [comsobTimeline, setComsobTimeline] = useState<Timeline | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const compareDisabledReason =
    !userTimeline || !comsobTimeline ? "Generate both timelines first" : undefined;
  const canCompare = compareDisabledReason === undefined;

  if (showDiff && userTimeline && comsobTimeline) {
    return (
      <div className="flex flex-col gap-4 pt-4 px-4">
        <div className="flex justify-center">
          <Button size="sm" onClick={() => setShowDiff(false)}>
            Back
          </Button>
        </div>
        <DiffSplitView timeline1={userTimeline} timeline2={comsobTimeline} />
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
            generated={userTimeline}
            setGenerated={setUserTimeline}
          />
        </section>
        <section className="flex-1 p-4">
          <ComsobImporterView
            title="Comsob"
            generated={comsobTimeline}
            setGenerated={setComsobTimeline}
          />
        </section>
      </div>
    </div>
  );
}

