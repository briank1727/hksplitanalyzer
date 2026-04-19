"use client";

import Dialog from "@/components/Dialog";

type HelpPanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function HelpPanel({ open, onClose }: HelpPanelProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Help">
      DeltaSOB (Delta Sum Of Best) is a tool for speedrunners to compare their
      splits against different comparisons, such as their Personal Best, Best
      Segments, or a custom comparison.
      <br />
      <br />
      It allows you to see the difference in time for each split and the
      cumulative difference throughout the run. You can import your splits from
      a LiveSplit (.lss) file or directly from supported web sources.
      <br />
      <br />
      How to Use:
      <br />
      <br />
      First import a LiveSplit file or fetch splits from a supported web source.
      Once you have imported your splits, use the dropdowns to select which
      comparisons and timing methods you want to use, and click "Generate
      Timeline" on each timeline panel to see the results (for ComSOBs it
      doesn't matter since they are just one time anyway).
      <br />
      <br />
      Check the{" "}
      <a
        href="https://www.speedrun.com/forums/speedrunning/xn8jj#rw8sp"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:no-underline"
      >
        big splits option
      </a>{" "}
      if you want to treat segments with multiple split times as a single
      segment, using the best time among them. This is useful for runs where you
      have multiple attempts at the same segment and want to see your best
      performance for that segment. You do not necessarily have to turn it off
      for lss files that don't have subsplits.
      <br />
      <br />
      Once you've generated a timeline for both timelines, you can scroll down
      to the Delta section and click compare to see the difference between the
      two timelines for each split and cumulatively.
      <br />
      <br />
      Important Note: DeltaSOB will not consider any split times that are zero,
      so make sure your splits are properly recorded in your LiveSplit file for
      accurate comparisons.
    </Dialog>
  );
}
