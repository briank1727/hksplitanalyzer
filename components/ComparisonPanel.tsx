"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Button from "@/components/Button";
import LiveSplitView from "@/components/LiveSplitView";
import { import_lss, WebLSS, fetch_web_lss } from "@/lib/import_lss";
import { Comparison } from "@/lib/comparison";
import { TimingMethod } from "@/lib/timing_method";
import { parse_lss, type LiveSplit } from "@/lib/lss_logic";

type ComparisonKey = keyof typeof Comparison;
type TimingMethodKey = keyof typeof TimingMethod;
type WebImportKey = keyof typeof WebLSS;

export default function ComparisonPanel({
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
  const [webImport, setWebImport] = useState<WebImportKey | "">("");

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

  const handleWebImport = async () => {
    if (!webImport) return;
    setImportError(null);
    setGenerated(null);
    setGenerateError(null);
    try {
      const result = await fetch_web_lss(WebLSS[webImport]);
      if (result.success) {
        setImported(result.data);
        setImportedFileName(WebLSS[webImport].name);
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
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {title}
      </h2>
      <Button onClick={handleImport}>Import LSS File</Button>
      <div className="mt-4 flex items-center gap-2">
        <select
          value={webImport}
          onChange={(e) => setWebImport(e.target.value as WebImportKey | "")}
          className="h-11 rounded-full border border-black/10 bg-white px-4 text-base text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">Select Web Source...</option>
          {(Object.keys(WebLSS) as WebImportKey[]).map((key) => (
            <option key={key} value={key}>
              {WebLSS[key].name}
            </option>
          ))}
        </select>
        <Button onClick={handleWebImport} disabled={!webImport}>
          Import ComSOB from Web
        </Button>
        <Button
          variant="secondary"
          disabled={!webImport}
          onClick={() => {
            if (!webImport) return;
            window.open(WebLSS[webImport].sheet_url, "_blank", "noopener,noreferrer");
          }}
        >
          Go to Sheet
        </Button>
      </div>
      {imported && importedFileName && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Successfully imported from {importedFileName}
        </div>
      )}
      {importError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Import failed: {importError}
        </div>
      )}
      <div className="mt-6 flex items-center gap-2">
        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value as ComparisonKey)}
          disabled={!imported}
          className="h-11 rounded-full border border-black/10 bg-white px-4 text-base text-black disabled:opacity-50 disabled:pointer-events-none dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {(Object.keys(Comparison) as ComparisonKey[]).map((key) => (
            <option key={key} value={key}>
              {Comparison[key].name}
            </option>
          ))}
        </select>
        <select
          value={timing}
          onChange={(e) => setTiming(e.target.value as TimingMethodKey)}
          disabled={!imported}
          className="h-11 rounded-full border border-black/10 bg-white px-4 text-base text-black disabled:opacity-50 disabled:pointer-events-none dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {(Object.keys(TimingMethod) as TimingMethodKey[]).map((key) => (
            <option key={key} value={key}>
              {TimingMethod[key].name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
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
        <Button onClick={handleGenerate} disabled={!imported}>
          Generate Comparison
        </Button>
      </div>
      <LiveSplitView
        data={generated}
        error={generateError}
        errorTitle="Comparison failed"
        timingMethod={timing}
      />
    </>
  );
}
