"use client";

import {
  useId,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Button from "@/components/Button";
import MessageBox from "@/components/MessageBox";
import OptionSelect from "@/components/OptionSelect";
import Panel, { NESTED_PANEL_COLOR } from "@/components/Panel";
import SplitsTable from "@/components/SplitsTable";
import { import_lss } from "@/lib/import_lss";
import { Comparison } from "@/lib/comparison";
import { parse_lss, type LiveSplit } from "@/lib/lss_logic";
import { formatTsDisplay, tsAdd, TS_ZERO, type Timespan } from "@/lib/timespan";
import type { Timeline } from "@/lib/timeline";

type ComparisonKey = keyof typeof Comparison;

const COMPARISON_OPTIONS = (Object.keys(Comparison) as ComparisonKey[]).map(
  (key) => ({ value: key, label: Comparison[key].name }),
);

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
  const [manualSplits, setManualSplits] = useState<boolean>(false);
  const bigSplitsId = useId();
  const manualSplitsId = useId();
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
      setGenerated(
        Comparison[choice].generate_comparison(
          imported,
          bigSplits,
          manualSplits,
        ),
      );
      console.log(
        Comparison[choice].generate_comparison(
          imported,
          bigSplits,
          manualSplits,
        ),
      );
    } catch (e) {
      setGenerated(null);
      setGenerateError(
        e instanceof Error ? e.message : "Failed to generate comparison",
      );
    }
  };

  return (
    <>
      <div className="h-96 overflow-hidden text-center">
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          {title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" onClick={handleImport}>
            Import LSS File
          </Button>
        </div>
        {imported && importedFileName && importedStats && (
          <MessageBox
            status="success"
            message={`Successfully imported ${importedFileName}`}
            className="mt-2"
          />
        )}
        {importError && (
          <MessageBox
            status="error"
            message={`Import failed: ${importError}`}
            className="mt-2"
          />
        )}
        <div className="mt-4">
          <Panel
            color={NESTED_PANEL_COLOR}
            className="grid grid-cols-[auto_auto] items-center justify-center gap-x-4 gap-y-2 text-left"
          >
            <span className="text-base text-black dark:text-zinc-50">
              Comparison
            </span>
            <OptionSelect
              label="Comparison"
              options={COMPARISON_OPTIONS}
              value={choice}
              onChange={setChoice}
              disabled={!imported}
              className="justify-self-center"
            />
            <label
              htmlFor={bigSplitsId}
              className="text-base text-black dark:text-zinc-50"
            >
              Big Splits
            </label>
            <input
              id={bigSplitsId}
              type="checkbox"
              checked={bigSplits}
              onChange={(e) => setBigSplits(e.target.checked)}
              disabled={!imported}
              className="justify-self-center rounded border border-black/10 dark:border-white/15"
            />
            <label
              htmlFor={manualSplitsId}
              className="text-base text-black dark:text-zinc-50"
            >
              Manual Splits
            </label>
            <input
              id={manualSplitsId}
              type="checkbox"
              checked={manualSplits}
              onChange={(e) => setManualSplits(e.target.checked)}
              disabled={!imported}
              className="justify-self-center rounded border border-black/10 dark:border-white/15"
            />
          </Panel>
        </div>
        <div className="mt-3 flex justify-center">
          <Button size="sm" onClick={handleGenerate} disabled={!imported}>
            Generate Timeline
          </Button>
        </div>
        {generated && generatedStats && (
          <MessageBox
            status="success"
            message={
              <>
                Timeline generated successfully ({generatedStats.numSplits}{" "}
                split
                {generatedStats.numSplits === 1 ? "" : "s"}
                {generatedStats.totalTime !== null &&
                  `, total time: ${formatTsDisplay(generatedStats.totalTime)}`}
                )
              </>
            }
            className="mt-2"
          />
        )}
      </div>
      <SplitsTable
        timeline={generated}
        setTimeline={setGenerated}
        error={generateError}
        errorTitle="Timeline failed"
      />
    </>
  );
}
