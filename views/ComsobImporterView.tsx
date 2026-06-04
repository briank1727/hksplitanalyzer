"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import SplitsTable from "@/components/SplitsTable";
import { WebComsob, fetch_comsob_timeline } from "@/lib/import_comsob";
import { formatTsDisplay, tsAdd, TS_ZERO, type Timespan } from "@/lib/timespan";
import { Timeline } from "@/lib/timeline";

type WebImportKey = keyof typeof WebComsob;

export default function ComsobImporterView({
  title,
  generated,
  setGenerated,
}: {
  title: string;
  generated: Timeline | null;
  setGenerated: Dispatch<SetStateAction<Timeline | null>>;
}) {
  const [importedName, setImportedName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const generatedStats = useMemo(() => {
    if (!generated) return null;
    const numSplits = generated.segments.length;
    let total: Timespan = TS_ZERO;
    for (const seg of generated.segments) {
      total = tsAdd(total, seg.game_time);
    }
    return { numSplits, totalTime: total };
  }, [generated]);

  const handleWebImport = async (key: WebImportKey) => {
    setDialogOpen(false);
    setImportError(null);
    setGenerated(null);
    setImportedName(null);
    try {
      const result = await fetch_comsob_timeline(WebComsob[key]);
      if (result.success) {
        setGenerated(result.data);
        setImportedName(WebComsob[key].name);
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
      <div className="h-80 overflow-hidden">
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            Select ComSOB
          </Button>
        </div>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Select ComSOB"
        >
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {(Object.keys(WebComsob) as WebImportKey[]).map((key) => (
              <li key={key} className="flex items-center gap-6">
                <Button
                  size="sm"
                  onClick={() => handleWebImport(key)}
                  className="flex-1"
                >
                  {WebComsob[key].name}
                </Button>
                <a
                  href={WebComsob[key].sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-4 text-sm text-blue-600 underline hover:no-underline dark:text-blue-400"
                >
                  Sheet
                </a>
              </li>
            ))}
          </ul>
        </Dialog>
        {generated && importedName && generatedStats && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            <div>
              Imported {importedName} ({generatedStats.numSplits} split
              {generatedStats.numSplits === 1 ? "" : "s"}
              {`, total time: ${formatTsDisplay(generatedStats.totalTime)}`}
              )
            </div>
          </div>
        )}
        {importError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Import failed: {importError}
          </div>
        )}
      </div>
      <SplitsTable
        data={generated}
        error={importError}
        errorTitle="Comsob failed"
      />
    </>
  );
}
