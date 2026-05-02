"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import SplitsView from "@/components/SplitsView";
import { WebLSS, fetch_web_lss } from "@/lib/import_lss";
import { type LiveSplit } from "@/lib/lss_logic";
import { formatTsDisplay, tsAdd, TS_ZERO, type Timespan } from "@/lib/timespan";

type WebImportKey = keyof typeof WebLSS;

export default function ComsobImporter({
  title,
  generated,
  setGenerated,
}: {
  title: string;
  generated: LiveSplit | null;
  setGenerated: Dispatch<SetStateAction<LiveSplit | null>>;
}) {
  const [importedName, setImportedName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const generatedStats = useMemo(() => {
    if (!generated) return null;
    const numSplits = generated.segments.length;
    let total: Timespan = TS_ZERO;
    let allTimed = true;
    for (const seg of generated.segments) {
      if (seg.split_times.length === 1) {
        total = tsAdd(total, seg.split_times[0].game_time);
      } else {
        allTimed = false;
      }
    }
    return { numSplits, totalTime: allTimed ? total : null };
  }, [generated]);

  const handleWebImport = async (key: WebImportKey) => {
    setImportError(null);
    setGenerated(null);
    setImportedName(null);
    try {
      const result = await fetch_web_lss(WebLSS[key]);
      if (result.success) {
        setGenerated(result.data);
        setImportedName(WebLSS[key].name);
      } else {
        setImportError(result.error);
      }
    } catch (e) {
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
      {generated && importedName && generatedStats && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          <div>
            Imported {importedName} ({generatedStats.numSplits} split
            {generatedStats.numSplits === 1 ? "" : "s"}
            {generatedStats.totalTime !== null &&
              `, total time: ${formatTsDisplay(generatedStats.totalTime)}`}
            )
          </div>
        </div>
      )}
      {importError && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Import failed: {importError}
        </div>
      )}
      <SplitsView
        data={generated}
        error={importError}
        errorTitle="Comsob failed"
      />
    </>
  );
}
