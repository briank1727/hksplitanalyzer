"use client";

import { useState } from "react";
import LiveSplitImporter from "@/components/LiveSplitImporter";
import ComsobImporter from "@/components/ComsobImporter";
import type { LiveSplit } from "@/lib/lss_logic";

export default function ComsobPage() {
  const [timeline, setTimeline] = useState<LiveSplit | null>(null);
  const [comsob, setComsob] = useState<LiveSplit | null>(null);

  return (
    <div className="flex flex-row flex-1 gap-4">
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
  );
}
