"use client";

import { useState } from "react";
import Button from "@/components/Button";
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
    !userTimeline || !comsobTimeline
      ? "Generate your timeline and select a ComSOB to compare"
      : undefined;

  const diffVisible = showDiff && userTimeline && comsobTimeline;

  // The setup view stays mounted while the diff is shown so the importers keep
  // their state (e.g. the parsed LSS file) when the user clicks Back.
  return (
    <>
      {diffVisible && (
        <div className="flex flex-col gap-2 pt-4 px-4">
          <div className="flex justify-center">
            <Button size="sm" onClick={() => setShowDiff(false)}>
              Back
            </Button>
          </div>
          <DiffSplitView timeline1={userTimeline} timeline2={comsobTimeline} />
        </div>
      )}
      <div
        className={`flex flex-col gap-2 pt-4 px-4 ${diffVisible ? "hidden" : ""}`}
      >
        <div className="flex justify-center">
          <span title={compareDisabledReason}>
            <Button
              size="lg"
              variant="success"
              disabled={compareDisabledReason !== undefined}
              onClick={() => setShowDiff(true)}
              className="text-2xl"
            >
              Compare
            </Button>
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Panel>
            <LiveSplitImporter
              title="Your Run"
              generated={userTimeline}
              setGenerated={setUserTimeline}
            />
          </Panel>
          <Panel>
            <ComsobImporterView
              title="ComSOB"
              generated={comsobTimeline}
              setGenerated={setComsobTimeline}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
