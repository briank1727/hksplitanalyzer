"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Button from "@/components/Button";
import SplitsTable from "@/components/SplitsTable";
import { import_lss } from "@/lib/import_lss";
import { Comparison } from "@/lib/comparison";
import { parse_lss, type LiveSplit } from "@/lib/lss_logic";
import { formatTsDisplay, tsAdd, TS_ZERO, type Timespan } from "@/lib/timespan";
import type { Timeline } from "@/lib/timeline";

type ComparisonKey = keyof typeof Comparison;

export default function LiveSplitImporter({
  title,
  generated,
  setGenerated,
}: {
  title: string;
  generated: Timeline | null;
  setGenerated: Dispatch<SetStateAction<Timeline | null>>;
}) {
  const [imported, setImported] = useState<LiveSplit | null>(null);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [choice, setChoice] = useState<ComparisonKey>("PersonalBest");
  const [bigSplits, setBigSplits] = useState<boolean>(true);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const importedStats = useMemo(() => {
    if (!imported) return null;
    return { numSplits: imported.segments.length };
  }, [imported]);

  const generatedStats = useMemo(() => {
    if (!generated) return null;
    const numSplits = generated.segments.length;
    let total: Timespan = TS_ZERO;
    for (const seg of generated.segments) {
      total = tsAdd(total, seg.game_time);
    }
    return { numSplits, totalTime: total };
  }, [generated]);

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
      setGenerated(Comparison[choice].generate_comparison(imported, bigSplits));
      console.log(Comparison[choice].generate_comparison(imported, bigSplits));
    } catch (e) {
      setGenerated(null);
      setGenerateError(
        e instanceof Error ? e.message : "Failed to generate comparison",
      );
    }
  };

  return (
    <>
      <div className="h-80 overflow-hidden">
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleImport}>
            Import LSS File
          </Button>
        </div>
        {imported && importedFileName && importedStats && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-base text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            <div>Successfully imported {importedFileName}</div>
          </div>
        )}
        {importError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Import failed: {importError}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none">
            <span className="text-base text-black dark:text-zinc-50">
              Comparison
            </span>
            <select
              value={choice}
              onChange={(e) => setChoice(e.target.value as ComparisonKey)}
              disabled={!imported}
              className="h-9 rounded-full border border-black/10 bg-white px-3 text-base text-black disabled:opacity-50 disabled:pointer-events-none dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {(Object.keys(Comparison) as ComparisonKey[]).map((key) => (
                <option key={key} value={key}>
                  {Comparison[key].name}
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
            <span className="text-base text-black dark:text-zinc-50">
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
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-base text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            <div>
              Timeline generated successfully ({generatedStats.numSplits} split
              {generatedStats.numSplits === 1 ? "" : "s"}
              {generatedStats.totalTime !== null &&
                `, total time: ${formatTsDisplay(generatedStats.totalTime)}`}
              )
            </div>
          </div>
        )}
      </div>
      <SplitsTable
        data={generated}
        error={generateError}
        errorTitle="Timeline failed"
      />
    </>
  );
}
