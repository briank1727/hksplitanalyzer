"use client";

import { useState } from "react";
import Button from "@/components/Button";
import SplitPieChart, { type SplitPieSlice } from "@/components/SplitPieChart";
import type { LiveSplit } from "@/lib/lss_logic";
import { DiffTime, DiffSortBy } from "@/lib/comparison";
import {
  diffBgStyle,
  formatDiff,
  formatPercent,
  percentBgStyle,
} from "@/lib/diff_format";
import { formatTsDisplay } from "@/lib/timespan";

type DiffSortByKey = keyof typeof DiffSortBy;

export default function DiffSplitView({
  timeline1,
  timeline2,
}: {
  timeline1: LiveSplit;
  timeline2: LiveSplit;
}) {
  const [sortBy, setSortBy] = useState<DiffSortByKey>("Order");
  const [isAscending, setIsAscending] = useState(true);
  const [swapped, setSwapped] = useState(false);

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
      const time1 =
        seg1.split_times.length === 1 ? seg1.split_times[0].game_time : null;
      const time2 =
        seg2.split_times.length === 1 ? seg2.split_times[0].game_time : null;
      if (time1 === null || time2 === null) return null;
      return new DiffTime(seg1.name, time1, time2);
    })
    .filter((row) => row !== null) as DiffTime[];

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
    <div>
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
        Delta
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSwapped((s) => !s)}
        >
          Swap Timelines
        </Button>
        <label className="flex items-center gap-1.5">
          <span className="text-sm text-black dark:text-zinc-50">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as DiffSortByKey)}
            className="h-9 rounded-full border border-black/10 bg-white px-3 text-sm text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {(Object.keys(DiffSortBy) as DiffSortByKey[]).map((key) => (
              <option key={key} value={key}>
                {DiffSortBy[key].name}
              </option>
            ))}
          </select>
        </label>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsAscending(!isAscending)}
        >
          {isAscending ? "Ascending" : "Descending"}
        </Button>
      </div>
      {lengthError && (
        <div
          role="alert"
          className="mt-4 text-sm rounded p-3 border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <div className="font-semibold">Error</div>
          <div className="mt-1">{lengthError}</div>
        </div>
      )}
      {warning && (
        <div
          role="alert"
          className="mt-4 text-sm rounded p-3 border border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
        >
          <div className="font-semibold">Warning</div>
          <pre className="mt-1 whitespace-pre-wrap break-words font-sans">
            {warning}
          </pre>
        </div>
      )}
      <div className="mt-3 flex gap-4">
        <div className="flex-1 min-w-0 max-h-[60vh] overflow-auto rounded bg-[#2a1f3d] text-zinc-100 text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-300">
                <th className="text-left font-semibold px-2 py-1.5"></th>
                <th className="text-right font-semibold px-2 py-1.5">T1</th>
                <th className="text-right font-semibold px-2 py-1.5">T2</th>
                <th className="text-right font-semibold px-2 py-1.5">+/-</th>
                <th className="text-right font-semibold px-2 py-1.5">%</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-b-0">
                  <td className="text-left px-2 py-1">{row.name}</td>
                  <td className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap">
                    {formatTsDisplay(row.time1)}
                  </td>
                  <td className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap">
                    {formatTsDisplay(row.time2)}
                  </td>
                  <td
                    style={diffBgStyle(row.diff(), diffThresholdMs)}
                    className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap"
                  >
                    {formatDiff(row.diff())}
                  </td>
                  <td
                    style={percentBgStyle(row.percent())}
                    className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap"
                  >
                    {formatPercent(row.percent())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex-1 min-w-0">
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
