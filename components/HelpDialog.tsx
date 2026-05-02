"use client";

import Dialog from "@/components/Dialog";

type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function HelpDialog({ open, onClose }: HelpDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Help">
      Hollow Knight Split Analyzer is a tool for speedrunners to compare their
      splits against different comparisons, such as their Personal Best, Best
      Segments, or the Community Sum of Best (ComSOB).
      <br />
      <br />
      For ComSOBs, HKSA will automatically fetch the most recent times from
      linked Google Sheets (click the links in the ComSOB dialogue to see the
      raw data).
      <br />
      <br />
      Important Note: HKSA will not consider any segment times that are manually
      inputted, so only splits which happened in a real run will be included in
      the analysis.
      <br />
      <br />
      How to Use:
      <br />
      <br />
      First select the tab you want to use at the top. The "Compare to ComSOB"
      tab allows you to import your splits and compare them to the ComSOB for
      your category, while the "Analyze Livesplit File" tab allows you to import
      a single LiveSplit file and analyze it on its own.
      <br />
      <br />
      The analysis includes a splits table showing your segment times, the
      comparison times, and the difference between them. Segments where you are
      ahead of the comparison will be highlighted in green, while segments where
      you are behind will be highlighted in red.
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
      segment, using the best time among them (it won't impact lss files that
      don't have subsplits).
      <br />
      <br />
    </Dialog>
  );
}
