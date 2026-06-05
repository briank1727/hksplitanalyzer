"use client";

import { useState } from "react";
import Button from "@/components/Button";
import SplitPieChart, { type SplitPieSlice } from "@/components/SplitPieChart";
import SplitsCompareTable from "@/components/SplitsCompareTable";
import type { Timeline } from "@/lib/timeline";
import { DiffTime, DiffSortBy } from "@/lib/comparison";

type DiffSortByKey = keyof typeof DiffSortBy;

export default function DiffSplitView({
  timeline1,
  timeline2,
}: {
  timeline1: Timeline;
  timeline2: Timeline;
}) {
  const [sortBy, setSortBy] = useState<DiffSortByKey>("Order");
  const [isAscending, setIsAscending] = useState(true);
  const [swapped, setSwapped] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);

  const t1 = swapped ? timeline2 : timeline1;
  const t2 = swapped ? timeline1 : timeline2;

  const compareLen = Math.min(t1.segments.length, t2.segments.length);
  const lengthError =
    t1.segments.length !== t2.segments.length
      ? `Timelines have different numbers of splits (${t1.segments.length} vs ${t2.segments.length}); comparing the first ${compareLen}.`
      : null;

  const mismatches: string[] = [];
  for (let i = 0; i < compareLen; i++) {
    const a = t1.segments[i];
    const b = t2.segments[i];
    if (a.auto_split_name !== b.auto_split_name) {
      mismatches.push(
        `Split ${i + 1}: auto split "${a.auto_split_name}" vs "${b.auto_split_name}"`,
      );
    }
  }
  const warning =
    mismatches.length > 0
      ? `Segment metadata differs between timelines; proceeding anyway:\n${mismatches.join("\n")}`
      : null;

  const rows = t1.segments
    .slice(0, compareLen)
    .map((seg1, i) => {
      const seg2 = t2.segments[i];
      return new DiffTime(seg1.name, seg1.auto_split_name, seg1.game_time, seg2.game_time);
    });

  const maxDiffMs =
    rows.length > 0
      ? Math.max(...rows.map((r) => Math.abs(Number(r.diff())) / 10000))
      : 0;
  const diffThresholdMs = Math.max(maxDiffMs, 1);

  let sortedRows = DiffSortBy[sortBy].sort(rows);
  if (!isAscending) {
    sortedRows = sortedRows.reverse();
  }

  const pieSlices: SplitPieSlice[] = sortedRows.map((row) => ({
    name: row.name,
    time: Math.max(0, Number(row.diff()) / 10000),
  }));
  const pieTotal = pieSlices.reduce((sum, s) => sum + s.time, 0);
  const hasPieData = pieTotal > 0;

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
        Delta
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setSwapped((s) => !s)}>
          Swap Timelines
        </Button>
        <label className="flex items-center gap-1.5">
          <span className="text-base text-black dark:text-zinc-50">
            Sort By
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as DiffSortByKey)}
            className="h-9 rounded-full border border-black/10 bg-white px-3 text-base text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {(Object.keys(DiffSortBy) as DiffSortByKey[]).map((key) => (
              <option key={key} value={key}>
                {DiffSortBy[key].name}
              </option>
            ))}
          </select>
        </label>
        <Button size="sm" onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? "Ascending" : "Descending"}
        </Button>
      </div>
      {lengthError && (
        <div
          role="alert"
          className="mt-4 text-sm rounded border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <button
            className="w-full flex items-center gap-1.5 px-3 py-2 font-semibold text-left"
            onClick={() => setErrorOpen((o) => !o)}
          >
            <span>{errorOpen ? "▾" : "▸"}</span>
            <span className="text-base">Error</span>
          </button>
          {errorOpen && <div className="px-3 pb-3">{lengthError}</div>}
        </div>
      )}
      {warning && (
        <div
          role="alert"
          className="mt-4 text-sm rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
        >
          <button
            className="w-full flex items-center gap-1.5 px-3 py-2 font-semibold text-left"
            onClick={() => setWarningOpen((o) => !o)}
          >
            <span>{warningOpen ? "▾" : "▸"}</span>
            <span className="text-base">Warning</span>
            {!warningOpen && (
              <span className="ml-1 font-normal">({mismatches.length})</span>
            )}
          </button>
          {warningOpen && (
            <pre className="px-3 pb-3 whitespace-pre-wrap break-words font-sans">
              {warning}
            </pre>
          )}
        </div>
      )}
      <div className="mt-3 flex gap-4">
        <div className="w-2/3 min-w-0">
          <SplitsCompareTable
            sortedRows={sortedRows}
            diffThresholdMs={diffThresholdMs}
          />
        </div>
        <div className="w-1/3 min-w-0">
          <h3 className="mb-2 text-md font-semibold tracking-tight text-black dark:text-zinc-50">
            Time Lost By Split
          </h3>
          {hasPieData ? (
            <SplitPieChart slices={pieSlices} />
          ) : (
            <div className="text-sm rounded p-3 border border-black/10 bg-white/5 text-black dark:border-white/15 dark:text-zinc-300">
              No time was lost on any split — nothing to chart.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

