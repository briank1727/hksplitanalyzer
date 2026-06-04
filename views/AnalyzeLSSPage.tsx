"use client";

import { useState } from "react";
import Button from "@/components/Button";
import SplitsTable from "@/components/SplitsTable";
import DiffSplitView from "@/views/DiffSplitView";
import { import_lss } from "@/lib/import_lss";
import { Comparison } from "@/lib/comparison";
import { parse_lss, type LiveSplit } from "@/lib/lss_logic";
import type { Timeline } from "@/lib/timeline";

type ComparisonKey = keyof typeof Comparison;

export default function AnalyzeLSSPage() {
  const [imported, setImported] = useState<LiveSplit | null>(null);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [choice1, setChoice1] = useState<ComparisonKey>("PersonalBest");
  const [choice2, setChoice2] = useState<ComparisonKey>("BestSegments");
  const [timeline1, setTimeline1] = useState<Timeline | null>(null);
  const [timeline2, setTimeline2] = useState<Timeline | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [bigSplits, setBigSplits] = useState<boolean>(true);

  const compareDisabledReason =
    !timeline1 || !timeline2 ? "Generate timelines first" : undefined;
  const canCompare = compareDisabledReason === undefined;

  const handleImport = async () => {
    setImportError(null);
    setTimeline1(null);
    setTimeline2(null);
    setGenerateError(null);
    let result: { content: string; fileName: string } | null;
    try {
      result = await import_lss();
    } catch (e) {
      setImported(null);
      setImportedFileName(null);
      setImportError(e instanceof Error ? e.message : "Failed to read file");
      return;
    }
    if (!result) return;
    try {
      setImported(parse_lss(result.content));
      setImportedFileName(result.fileName);
    } catch (e) {
      setImported(null);
      setImportedFileName(null);
      setImportError(
        e instanceof Error ? e.message : "Failed to parse LSS file",
      );
    }
  };

  const handleGenerate = () => {
    if (!imported) return;
    setGenerateError(null);
    try {
      setTimeline1(
        Comparison[choice1].generate_comparison(imported, bigSplits),
      );
      setTimeline2(
        Comparison[choice2].generate_comparison(imported, bigSplits),
      );
    } catch (e) {
      setTimeline1(null);
      setTimeline2(null);
      setGenerateError(
        e instanceof Error ? e.message : "Failed to generate timelines",
      );
    }
  };

  if (showDiff && timeline1 && timeline2) {
    return (
      <div className="flex flex-col gap-4 pt-4 px-4">
        <div className="flex justify-center">
          <Button size="sm" onClick={() => setShowDiff(false)}>
            ← Back
          </Button>
        </div>
        <DiffSplitView timeline1={timeline1} timeline2={timeline2} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4 px-4">
      <div className="flex justify-center">
        <span title={compareDisabledReason}>
          <Button
            size="lg"
            variant="success"
            disabled={!canCompare}
            onClick={() => setShowDiff(true)}
            className="text-2xl"
          >
            Compare
          </Button>
        </span>
      </div>
      <div className="flex flex-wrap justify-around items-center gap-2">
        <Button size="sm" onClick={handleImport}>
          Import LSS
        </Button>
        <label className="flex items-center gap-1.5">
          <span className="text-sm text-black dark:text-zinc-50">
            Timeline 1 Comparison
          </span>
          <select
            value={choice1}
            onChange={(e) => setChoice1(e.target.value as ComparisonKey)}
            disabled={!imported}
            className="h-9 rounded-full border border-black/10 bg-white px-3 text-sm text-black disabled:opacity-50 disabled:pointer-events-none dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {(Object.keys(Comparison) as ComparisonKey[]).map((key) => (
              <option key={key} value={key}>
                {Comparison[key].name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-sm text-black dark:text-zinc-50">
            Timeline 2 Comparison
          </span>
          <select
            value={choice2}
            onChange={(e) => setChoice2(e.target.value as ComparisonKey)}
            disabled={!imported}
            className="h-9 rounded-full border border-black/10 bg-white px-3 text-sm text-black disabled:opacity-50 disabled:pointer-events-none dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {(Object.keys(Comparison) as ComparisonKey[]).map((key) => (
              <option key={key} value={key}>
                {Comparison[key].name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={bigSplits}
            onChange={(e) => setBigSplits(e.target.checked)}
            disabled={!imported}
            className="rounded border border-black/10 dark:border-white/15"
          />
          <span className="text-sm text-black dark:text-zinc-50">
            Big Splits
          </span>
        </label>
        <Button size="sm" onClick={handleGenerate} disabled={!imported}>
          Generate Timelines
        </Button>
      </div>
      {imported && importedFileName && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Successfully imported {importedFileName}
        </div>
      )}
      {importError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Import failed: {importError}
        </div>
      )}
      <div className="flex flex-row">
        <section className="flex-1 p-4 border-r border-black/10 dark:border-white/15">
          <SplitsTable
            timeline={timeline1}
            error={generateError}
            errorTitle="Timeline failed"
          />
        </section>
        <section className="flex-1 p-4">
          <SplitsTable
            timeline={timeline2}
            error={generateError}
            errorTitle="Timeline failed"
          />
        </section>
      </div>
    </div>
  );
}
