"use client";

import { useState } from "react";
import Button from "@/components/Button";
import type { LiveSplit } from "@/lib/lss_logic";
import { DiffTime, DiffSortBy } from "@/lib/comparison";
import { TimingMethod } from "@/lib/timing_method";
import { formatTsDisplay, ticksToTs } from "@/lib/timespan";

type TimingMethodKey = keyof typeof TimingMethod;
type DiffSortByKey = keyof typeof DiffSortBy;

function formatDiff(ticks: bigint): string {
  if (ticks === 0n) return formatTsDisplay(ticksToTs(0n));
  const sign = ticks > 0n ? "+" : "-";
  const abs = ticks < 0n ? -ticks : ticks;
  return sign + formatTsDisplay(ticksToTs(abs));
}

function formatPercent(p: number): string {
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(2)}%`;
}

const PERCENT_FULL_INTENSITY = 20;
const DIFF_FULL_INTENSITY_MS = 30000; // 30 seconds in milliseconds

function percentBgStyle(p: number | null): { backgroundColor?: string } {
  if (p === null || p === 0) return {};
  const t = Math.min(Math.abs(p) / PERCENT_FULL_INTENSITY, 1);
  const lerp = (a: number, b: number) => a + (b - a) * t;
  // light → dark, with alpha also ramping up so the dark bg still shows through low magnitudes
  const [from, to] =
    p > 0
      ? [
          [255, 170, 170], // red-200
          [200, 20, 20], //   red-900
        ]
      : [
          [187, 247, 208], // green-200
          [20, 83, 45], //    green-900
        ];
  const r = Math.round(lerp(from[0], to[0]));
  const g = Math.round(lerp(from[1], to[1]));
  const b = Math.round(lerp(from[2], to[2]));
  const a = lerp(0.35, 0.9).toFixed(3);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` };
}

function diffBgStyle(
  ticks: bigint | null,
  maxMs: number,
): { backgroundColor?: string } {
  if (ticks === null || ticks === 0n || maxMs === 0) return {};
  // Convert ticks to milliseconds (10000 ticks = 1ms)
  const ms = Number(ticks < 0n ? -ticks : ticks) / 10000;
  const t = Math.min(ms / maxMs, 1);
  const lerp = (a: number, b: number) => a + (b - a) * t;
  // light → dark, with alpha also ramping up so the dark bg still shows through low magnitudes
  const [from, to] =
    ticks > 0n
      ? [
          [255, 170, 170], // red-200
          [200, 20, 20], //   red-900
        ]
      : [
          [187, 247, 208], // green-200
          [20, 83, 45], //    green-900
        ];
  const r = Math.round(lerp(from[0], to[0]));
  const g = Math.round(lerp(from[1], to[1]));
  const b = Math.round(lerp(from[2], to[2]));
  const a = lerp(0.35, 0.9).toFixed(3);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` };
}

export default function DiffSplitView({
  timeline1,
  timeline2,
}: {
  timeline1: LiveSplit | null;
  timeline2: LiveSplit | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<DiffSortByKey>("Order");
  const [isAscending, setIsAscending] = useState(true);
  const [timing, setTiming] = useState<TimingMethodKey>("GameTime");
  const [local1, setLocal1] = useState<LiveSplit | null>(null);
  const [local2, setLocal2] = useState<LiveSplit | null>(null);

  const handleCompare = () => {
    setError(null);
    setWarning(null);
    setLocal1(null);
    setLocal2(null);

    if (!timeline1 || !timeline2) {
      setError("Both timelines must be generated before comparing.");
      return;
    }

    if (timeline1.segments.length !== timeline2.segments.length) {
      setError(
        `Timelines have different numbers of splits (${timeline1.segments.length} vs ${timeline2.segments.length}).`,
      );
      return;
    }

    const copy1 = structuredClone(timeline1);
    const copy2 = structuredClone(timeline2);

    const mismatches: string[] = [];
    for (let i = 0; i < copy1.segments.length; i++) {
      const a = copy1.segments[i];
      const b = copy2.segments[i];
      if (a.auto_split_name !== b.auto_split_name) {
        mismatches.push(
          `Split ${i + 1}: auto split "${a.auto_split_name}" vs "${b.auto_split_name}"`,
        );
      }
    }

    if (mismatches.length > 0) {
      setWarning(
        `Segment metadata differs between timelines; proceeding anyway:\n${mismatches.join("\n")}`,
      );
    }
    setLocal1(copy1);
    setLocal2(copy2);
  };

  const handleSwap = () => {
    setLocal1(local2);
    setLocal2(local1);
  };

  const valid = local1 !== null && local2 !== null;
  const showDiff = valid;

  const tm = TimingMethod[timing];
  const rows = showDiff
    ? (local1!.segments
        .map((seg1, i) => {
          const seg2 = local2!.segments[i];
          const time1 =
            seg1.split_times.length === 1
              ? tm.time_of_split(seg1.split_times[0])
              : null;
          const time2 =
            seg2.split_times.length === 1
              ? tm.time_of_split(seg2.split_times[0])
              : null;
          if (time1 === null || time2 === null) return null;
          return new DiffTime(seg1.name, time1, time2);
        })
        .filter((row) => row !== null) as DiffTime[])
    : [];

  // Calculate max absolute diff in milliseconds for gradient scaling
  const maxDiffMs =
    rows.length > 0
      ? Math.max(...rows.map((r) => Math.abs(Number(r.diff())) / 10000))
      : 0;
  // Use at least 1ms as threshold to avoid division by zero
  const diffThresholdMs = Math.max(maxDiffMs, 1);

  // Apply sorting
  let sortedRows = DiffSortBy[sortBy].sort(rows);
  if (!isAscending) {
    sortedRows = sortedRows.reverse();
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
        Delta
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <span
          title={
            !timeline1 || !timeline2
              ? "Generate two timelines first"
              : undefined
          }
        >
          <Button
            size="sm"
            variant="success"
            onClick={handleCompare}
            disabled={!timeline1 || !timeline2}
          >
            Compare
          </Button>
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSwap}
          disabled={!local1 && !local2}
        >
          Swap Timelines
        </Button>
        <label className="flex items-center gap-1.5">
          <span className="text-sm text-black dark:text-zinc-50">Timing</span>
          <select
            value={timing}
            onChange={(e) => setTiming(e.target.value as TimingMethodKey)}
            className="h-9 rounded-full border border-black/10 bg-white px-3 text-sm text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {(Object.keys(TimingMethod) as TimingMethodKey[]).map((key) => (
              <option key={key} value={key}>
                {TimingMethod[key].name}
              </option>
            ))}
          </select>
        </label>
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
      {error && (
        <div
          role="alert"
          className="mt-4 text-sm rounded p-3 border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
        >
          <div className="font-semibold">Comparison failed</div>
          <div className="mt-1 break-words">{error}</div>
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
      {valid && !warning && (
        <div
          role="status"
          className="mt-4 text-sm rounded p-3 border border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
        >
          Comparisons are valid.
        </div>
      )}
      {showDiff && (
        <div className="mt-3 max-h-[60vh] overflow-auto rounded bg-[#2a1f3d] text-zinc-100 text-xs">
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
      )}
    </div>
  );
}
