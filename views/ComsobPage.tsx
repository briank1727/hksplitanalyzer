"use client";

import { useState } from "react";
import Button from "@/components/Button";
import CompareBar from "@/components/CompareBar";
import Panel from "@/components/Panel";
import ComsobImporterView from "@/views/ComsobImporterView";
import DiffSplitView from "@/views/DiffSplitView";
import LiveSplitImporter from "@/views/LiveSplitImporterView";
import { Timeline } from "@/lib/timeline";

export default function ComsobPage() {
  const [userTimeline, setUserTimeline] = useState<Timeline | null>(null);
  const [comsobTimeline, setComsobTimeline] = useState<Timeline | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const compareDisabledReason =
    !userTimeline || !comsobTimeline ? "Generate your timeline and select a ComSOB to compare" : undefined;

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel>
          <LiveSplitImporter
            title="Your Run"
            generated={userTimeline}
            setGenerated={setUserTimeline}
          />
        </Panel>
        <Panel>
          <ComsobImporterView
            title="Comsob"
            generated={comsobTimeline}
            setGenerated={setComsobTimeline}
          />
        </Panel>
      </div>
      <CompareBar
        disabledReason={compareDisabledReason}
        onCompare={() => setShowDiff(true)}
      />
    </div>
  );
}
