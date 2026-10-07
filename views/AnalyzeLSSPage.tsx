"use client";

import { useState } from "react";
import Button from "@/components/Button";
import MessageBox from "@/components/MessageBox";
import OptionSelect, { TOGGLE_OPTIONS } from "@/components/OptionSelect";
import Panel from "@/components/Panel";
import SplitsTable from "@/components/SplitsTable";
import DiffSplitView from "@/views/DiffSplitView";
import { import_lss } from "@/lib/import_lss";
import { Comparison } from "@/lib/comparison";
import { parse_lss, type LiveSplit } from "@/lib/lss_logic";
import type { Timeline } from "@/lib/timeline";

type ComparisonKey = keyof typeof Comparison;

const COMPARISON_OPTIONS = (Object.keys(Comparison) as ComparisonKey[]).map(
  (key) => ({ value: key, label: Comparison[key].name }),
);

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
  const [manualSplits, setManualSplits] = useState<boolean>(false);

  const compareDisabledReason =
    !timeline1 || !timeline2 ? "Generate timelines first" : undefined;

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
        Comparison[choice1].generate_comparison(
          imported,
          bigSplits,
          manualSplits,
        ),
      );
      setTimeline2(
        Comparison[choice2].generate_comparison(
          imported,
          bigSplits,
          manualSplits,
        ),
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
      <div className="flex flex-col gap-2 pt-4 px-4">
        <div className="flex justify-center">
          <Button size="sm" onClick={() => setShowDiff(false)}>
            Back
          </Button>
        </div>
        <DiffSplitView timeline1={timeline1} timeline2={timeline2} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-4 px-4">
      <div className="flex justify-center">
        <span title={compareDisabledReason}>
          <Button
            size="lg"
            variant="success"
            disabled={compareDisabledReason !== undefined}
            onClick={() => setShowDiff(true)}
            className="text-2xl"
          >
            Compare
          </Button>
        </span>
      </div>
      <Panel showEmbellishments className="flex flex-col items-center gap-3">
        <Button size="sm" onClick={handleImport}>
          Import LSS
        </Button>
        <div className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-2 text-left">
          <span className="text-sm text-black dark:text-zinc-50">
            Timeline 1 Comparison
          </span>
          <OptionSelect
            label="Timeline 1 Comparison"
            options={COMPARISON_OPTIONS}
            value={choice1}
            onChange={setChoice1}
            disabled={!imported}
            className="justify-self-center text-sm"
          />
          <span className="text-sm text-black dark:text-zinc-50">
            Timeline 2 Comparison
          </span>
          <OptionSelect
            label="Timeline 2 Comparison"
            options={COMPARISON_OPTIONS}
            value={choice2}
            onChange={setChoice2}
            disabled={!imported}
            className="justify-self-center text-sm"
          />
          <span className="text-sm text-black dark:text-zinc-50">
            Big Splits
          </span>
          <OptionSelect
            label="Big Splits"
            options={TOGGLE_OPTIONS}
            value={bigSplits ? "enabled" : "disabled"}
            onChange={(v) => setBigSplits(v === "enabled")}
            disabled={!imported}
            className="justify-self-center text-sm"
          />
          <span className="text-sm text-black dark:text-zinc-50">
            Manual Splits
          </span>
          <OptionSelect
            label="Manual Splits"
            options={TOGGLE_OPTIONS}
            value={manualSplits ? "enabled" : "disabled"}
            onChange={(v) => setManualSplits(v === "enabled")}
            disabled={!imported}
            className="justify-self-center text-sm"
          />
        </div>
        <Button size="sm" onClick={handleGenerate} disabled={!imported}>
          Generate Timelines
        </Button>
      </Panel>
      {imported && importedFileName && (
        <MessageBox
          status="success"
          message={`Successfully imported ${importedFileName}`}
        />
      )}
      {importError && (
        <MessageBox status="error" message={`Import failed: ${importError}`} />
      )}
      {(timeline1 || timeline2 || generateError) && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Panel showEmbellishments>
            <SplitsTable
              timeline={timeline1}
              setTimeline={setTimeline1}
              error={generateError}
              errorTitle="Timeline failed"
            />
          </Panel>
          <Panel showEmbellishments>
            <SplitsTable
              timeline={timeline2}
              setTimeline={setTimeline2}
              error={generateError}
              errorTitle="Timeline failed"
            />
          </Panel>
        </div>
      )}
    </div>
  );
}
