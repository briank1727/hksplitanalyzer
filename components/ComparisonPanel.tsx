"use client";

import { useState } from "react";
import Button from "@/components/Button";
import LiveSplitView from "@/components/LiveSplitView";
import { import_lss } from "@/lib/import_lss";
import { Comparison, parse_lss, type LiveSplit } from "@/lib/lss_logic";

type ComparisonKey = keyof typeof Comparison;

export default function ComparisonPanel({ title }: { title: string }) {
  const [imported, setImported] = useState<LiveSplit | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [choice, setChoice] = useState<ComparisonKey>("PersonalBest");
  const [generated, setGenerated] = useState<LiveSplit | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleImport = async () => {
    setImportError(null);
    setGenerated(null);
    setGenerateError(null);
    let contents: string | null;
    try {
      contents = await import_lss();
    } catch (e) {
      setImported(null);
      setImportError(e instanceof Error ? e.message : "Failed to read file");
      return;
    }
    if (!contents) return;
    try {
      setImported(parse_lss(contents));
    } catch (e) {
      setImported(null);
      setImportError(
        e instanceof Error ? e.message : "Failed to parse LSS file",
      );
    }
  };

  const handleGenerate = () => {
    if (!imported) return;
    setGenerateError(null);
    try {
      setGenerated(Comparison[choice].generate_comparison(imported));
    } catch (e) {
      setGenerated(null);
      setGenerateError(
        e instanceof Error ? e.message : "Failed to generate comparison",
      );
    }
  };

  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {title}
      </h2>
      <Button onClick={handleImport}>Import LSS</Button>
      <LiveSplitView
        data={imported}
        error={importError}
        errorTitle="Import failed"
      />
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
        <Button
          variant="secondary"
          onClick={handleGenerate}
          disabled={!imported}
        >
          Generate Comparison
        </Button>
      </div>
      <LiveSplitView
        data={generated}
        error={generateError}
        errorTitle="Comparison failed"
      />
    </>
  );
}
