"use client";

import { useState } from "react";
import Button from "@/components/Button";
import MessageBox from "@/components/MessageBox";
import OptionSelect from "@/components/OptionSelect";
import Panel, { NESTED_PANEL_COLOR } from "@/components/Panel";
import SplitPieChart, { type SplitPieSlice } from "@/components/SplitPieChart";
import SplitsCompareTable from "@/components/SplitsCompareTable";
import type { Timeline } from "@/lib/timeline";
import { DiffTime, DiffSortBy } from "@/lib/comparison";

type DiffSortByKey = keyof typeof DiffSortBy;

const SORT_OPTIONS = (Object.keys(DiffSortBy) as DiffSortByKey[]).map((key) => ({
  value: key,
  label: DiffSortBy[key].name,
}));

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
      <Panel>
        <h2 className="mb-3 text-center text-lg font-semibold tracking-tight text-zinc-50">
          Delta
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" onClick={() => setSwapped((s) => !s)}>
            Swap Timelines
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="text-base text-zinc-50">
              Sort By
            </span>
            <OptionSelect
              label="Sort By"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
          <Button size="sm" onClick={() => setIsAscending(!isAscending)}>
            {isAscending ? "Ascending" : "Descending"}
          </Button>
        </div>
        {lengthError && (
          <MessageBox
            status="error"
            message={
              <>
                <button
                  className="w-full flex items-center gap-1.5 font-semibold text-left"
                  onClick={() => setErrorOpen((o) => !o)}
                >
                  <span>{errorOpen ? "▾" : "▸"}</span>
                  <span>Error</span>
                </button>
                {errorOpen && <div className="pt-2">{lengthError}</div>}
              </>
            }
            className="mt-2"
          />
        )}
        {warning && (
          <MessageBox
            status="warning"
            message={
              <>
                <button
                  className="w-full flex items-center gap-1.5 font-semibold text-left"
                  onClick={() => setWarningOpen((o) => !o)}
                >
                  <span>{warningOpen ? "▾" : "▸"}</span>
                  <span>Warning</span>
                  {!warningOpen && (
                    <span className="ml-1 font-normal">({mismatches.length})</span>
                  )}
                </button>
                {warningOpen && (
                  <pre className="pt-2 whitespace-pre-wrap break-words font-sans">
                    {warning}
                  </pre>
                )}
              </>
            }
            className="mt-2"
          />
        )}
        <div className="mt-2 flex gap-2">
          <div className="w-2/3 min-w-0">
            <SplitsCompareTable
              sortedRows={sortedRows}
              diffThresholdMs={diffThresholdMs}
            />
          </div>
          <div className="w-1/3 min-w-0">
            <Panel color={NESTED_PANEL_COLOR}>
              <h3 className="mb-2 text-center text-md font-semibold tracking-tight text-zinc-50">
                Time Lost By Split
              </h3>
              {hasPieData ? (
                <SplitPieChart slices={pieSlices} />
              ) : (
                <p className="text-center text-sm text-zinc-300">
                  No time was lost on any split — nothing to chart.
                </p>
              )}
            </Panel>
          </div>
        </div>
      </Panel>
    </div>
  );
}

