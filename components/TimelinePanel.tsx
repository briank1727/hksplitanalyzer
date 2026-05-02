"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import LiveSplitView from "@/components/LiveSplitView";
import { import_lss, WebLSS, fetch_web_lss } from "@/lib/import_lss";
import { Comparison } from "@/lib/comparison";
import { TimingMethod } from "@/lib/timing_method";
import { parse_lss, type LiveSplit } from "@/lib/lss_logic";
import {
  formatTsDisplay,
  tsAdd,
  TS_ZERO,
  type Timespan,
} from "@/lib/timespan";

type ComparisonKey = keyof typeof Comparison;
type TimingMethodKey = keyof typeof TimingMethod;
type WebImportKey = keyof typeof WebLSS;

export default function TimelinePanel({
  title,
  generated,
  setGenerated,
}: {
  title: string;
  generated: LiveSplit | null;
  setGenerated: Dispatch<SetStateAction<LiveSplit | null>>;
}) {
  const [imported, setImported] = useState<LiveSplit | null>(null);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [choice, setChoice] = useState<ComparisonKey>("PersonalBest");
  const [timing, setTiming] = useState<TimingMethodKey>("GameTime");
  const [bigSplits, setBigSplits] = useState<boolean>(true);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [webDialogOpen, setWebDialogOpen] = useState<boolean>(false);

  const importedStats = useMemo(() => {
    if (!imported) return null;
    return { numSplits: imported.segments.length };
  }, [imported]);

  const generatedStats = useMemo(() => {
    if (!generated) return null;
    const numSplits = generated.segments.length;
    const tm = TimingMethod[timing];
    let total: Timespan = TS_ZERO;
    let allTimed = true;
    for (const seg of generated.segments) {
      if (seg.split_times.length === 1) {
        total = tsAdd(total, tm.time_of_split(seg.split_times[0]));
      } else {
        allTimed = false;
      }
    }
    return { numSplits, totalTime: allTimed ? total : null };
  }, [generated, timing]);

  const handleImport = async () => {
    setImportError(null);
    setGenerated(null);
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
      setGenerated(
        Comparison[choice].generate_comparison(
          imported,
          TimingMethod[timing],
          bigSplits,
        ),
      );
      console.log(
        Comparison[choice].generate_comparison(
          imported,
          TimingMethod[timing],
          bigSplits,
        ),
      );
    } catch (e) {
      setGenerated(null);
      setGenerateError(
        e instanceof Error ? e.message : "Failed to generate comparison",
      );
    }
  };

  const handleWebImport = async (key: WebImportKey) => {
    setWebDialogOpen(false);
    setImportError(null);
    setGenerated(null);
    setGenerateError(null);
    try {
      const result = await fetch_web_lss(WebLSS[key]);
      if (result.success) {
        setImported(result.data);
        setImportedFileName(WebLSS[key].name);
        console.log(result.data);
      } else {
        setImported(null);
        setImportedFileName(null);
        setImportError(result.error);
      }
    } catch (e) {
      setImported(null);
      setImportedFileName(null);
      setImportError(
        e instanceof Error ? e.message : "Failed to import from web",
      );
    }
  };

  return (
    <>
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={handleImport}>
          Import LSS File
        </Button>
        <Button size="sm" onClick={() => setWebDialogOpen(true)}>
          Compare to ComSOB
        </Button>
      </div>
      <Dialog
        open={webDialogOpen}
        onClose={() => setWebDialogOpen(false)}
        title="Compare to ComSOB"
      >
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {(Object.keys(WebLSS) as WebImportKey[]).map((key) => (
            <li key={key} className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => handleWebImport(key)}
                className="h-9 flex-1 rounded-full border border-black/15 bg-white px-4 text-center text-sm font-medium text-black shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:border-white/20 dark:bg-zinc-100 dark:text-black dark:hover:bg-white"
              >
                {WebLSS[key].name}
              </button>
              <a
                href={WebLSS[key].sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 underline hover:no-underline dark:text-blue-400"
              >
                Sheet
              </a>
            </li>
          ))}
        </ul>
      </Dialog>
      {imported && importedFileName && importedStats && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          <div>Successfully imported from {importedFileName}</div>
          <div>
            {importedStats.numSplits} split
            {importedStats.numSplits === 1 ? "" : "s"}
          </div>
        </div>
      )}
      {importError && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Import failed: {importError}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none">
          <span className="text-sm text-black dark:text-zinc-50">
            Comparison
          </span>
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value as ComparisonKey)}
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
        <label className="flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none">
          <span className="text-sm text-black dark:text-zinc-50">Timing</span>
          <select
            value={timing}
            onChange={(e) => setTiming(e.target.value as TimingMethodKey)}
            disabled={!imported}
            className="h-9 rounded-full border border-black/10 bg-white px-3 text-sm text-black disabled:opacity-50 disabled:pointer-events-none dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {(Object.keys(TimingMethod) as TimingMethodKey[]).map((key) => (
              <option key={key} value={key}>
                {TimingMethod[key].name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none">
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
      </div>
      <div className="mt-3 flex justify-center">
        <Button size="sm" onClick={handleGenerate} disabled={!imported}>
          Generate Timeline
        </Button>
      </div>
      {generated && generatedStats && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          <div>Timeline generated successfully</div>
          <div>
            {generatedStats.numSplits} split
            {generatedStats.numSplits === 1 ? "" : "s"}
            {generatedStats.totalTime !== null &&
              `, total ${formatTsDisplay(generatedStats.totalTime)}`}
          </div>
        </div>
      )}
      <LiveSplitView
        data={generated}
        error={generateError}
        errorTitle="Timeline failed"
        timingMethod={timing}
      />
    </>
  );
}
