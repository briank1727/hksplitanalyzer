"use client";

type HelpPanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function HelpPanel({ open, onClose }: HelpPanelProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/15 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="help-dialog-title"
            className="text-xl font-semibold text-black dark:text-zinc-50"
          >
            Help
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-black hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:text-zinc-50 dark:hover:bg-white/10 dark:focus-visible:ring-white/40"
          >
            ×
          </button>
        </div>
        <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
          DeltaSOB (Delta Sum Of Best) is a tool for speedrunners to compare
          their splits against different comparisons, such as their Personal
          Best, Best Segments, or a custom comparison.
          <br />
          <br />
          It allows you to see the difference in time for each split and the
          cumulative difference throughout the run. You can import your splits
          from a LiveSplit (.lss) file or directly from supported web sources.
          <br />
          <br />
          How to Use:
          <br />
          <br />
          First import a LiveSplit file or fetch splits from a supported web
          source. Once you have imported your splits, use the dropdowns to
          select which comparisons and timing methods you want to use, and click
          "Generate Comparison" on each comparison panel to see the results (for
          ComSOBs it doesn't matter since they are just one time anyway).
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
          segment, using the best time among them. This is useful for runs where
          you have multiple attempts at the same segment and want to see your
          best performance for that segment. You do not necessarily have to turn
          it off for lss files that don't have subsplits.
          <br />
          <br />
          Once you've generated a comparison for both comparisons, you can
          scroll down to the Delta section and click compare to see the
          difference between the two comparisons for each split and
          cumulatively.
          <br />
          <br />
          Important Note: DeltaSOB will not consider any split times that are
          zero, so make sure your splits are properly recorded in your LiveSplit
          file for accurate comparisons.
        </div>
      </div>
    </div>
  );
}
