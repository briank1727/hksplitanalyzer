"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import MessageBox from "@/components/MessageBox";
import SplitsTable from "@/components/SplitsTable";
import Tabs from "@/components/Tabs";
import { HKWebComsob, SilksongWebComsob, fetch_comsob_timeline, type WebComsobKind } from "@/lib/import_comsob";
import { formatTsDisplay, tsAdd, TS_ZERO, type Timespan } from "@/lib/timespan";
import { Timeline } from "@/lib/timeline";

type HKWebKey = keyof typeof HKWebComsob;
type SilksongWebKey = keyof typeof SilksongWebComsob;

const GAME_TABS = [
  { key: "hk", label: "Hollow Knight" },
  { key: "silksong", label: "Silksong" },
] as const;

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
  const [dialogTab, setDialogTab] = useState<"hk" | "silksong">("hk");

  const generatedStats = useMemo(() => {
    if (!generated) return null;
    const numSplits = generated.segments.length;
    let total: Timespan = TS_ZERO;
    for (const seg of generated.segments) {
      total = tsAdd(total, seg.game_time);
    }
    return { numSplits, totalTime: total };
  }, [generated]);

  const handleWebImport = async (comsob: WebComsobKind) => {
    setDialogOpen(false);
    setImportError(null);
    setGenerated(null);
    setImportedName(null);
    try {
      const result = await fetch_comsob_timeline(comsob);
      if (result.success) {
        setGenerated(result.data);
        setImportedName(comsob.name);
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
        <h2 className="mb-3 text-center text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          {title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            Select ComSOB
          </Button>
        </div>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Select ComSOB"
        >
          <Tabs
            tabs={GAME_TABS}
            active={dialogTab}
            onChange={setDialogTab}
            className="mb-4"
          />
          <ul className="max-h-[70vh] space-y-2 overflow-y-auto">
            {dialogTab === "hk"
              ? (Object.keys(HKWebComsob) as HKWebKey[]).map((key) => (
                  <li key={key} className="flex items-center gap-6">
                    <Button
                      size="sm"
                      onClick={() => handleWebImport(HKWebComsob[key])}
                      className="flex-1"
                    >
                      {HKWebComsob[key].name}
                    </Button>
                    <a
                      href={HKWebComsob[key].sheet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-4 text-sm text-blue-600 underline hover:no-underline dark:text-blue-400"
                    >
                      Sheet
                    </a>
                  </li>
                ))
              : (Object.keys(SilksongWebComsob) as SilksongWebKey[]).map((key) => (
                  <li key={key} className="flex items-center gap-6">
                    <Button
                      size="sm"
                      onClick={() => handleWebImport(SilksongWebComsob[key])}
                      className="flex-1"
                    >
                      {SilksongWebComsob[key].name}
                    </Button>
                    <a
                      href={SilksongWebComsob[key].sheet_url}
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
          <MessageBox
            status="success"
            message={
              <>
                Imported {importedName} ({generatedStats.numSplits} split
                {generatedStats.numSplits === 1 ? "" : "s"}
                {`, total time: ${formatTsDisplay(generatedStats.totalTime)}`}
                )
              </>
            }
            className="mt-2 text-center"
          />
        )}
        {!generated && !importError && (
          <div className="mt-4 flex h-48 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/15 text-center dark:border-white/15">
            <span className="text-lg text-zinc-600 dark:text-zinc-300">
              No ComSOB selected
            </span>
            <span className="max-w-xs text-sm text-zinc-500">
              Pick a community sum of best to compare your run against.
            </span>
          </div>
        )}
        {importError && (
          <MessageBox
            status="error"
            message={`Import failed: ${importError}`}
            className="mt-2 text-center"
          />
        )}
      </div>
      <SplitsTable
        timeline={generated}
        setTimeline={setGenerated}
        error={importError}
        errorTitle="Comsob failed"
      />
    </>
  );
}
