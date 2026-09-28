"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import ComsobPage from "@/views/ComsobPage";
import AnalyzeLSSPage from "@/views/AnalyzeLSSPage";
import logo from "@/public/logo.png";
import bench from "@/public/bench.png";

type Tab = "compare" | "analyze";

const TABS = [
  { key: "compare", label: "Compare to ComSOB" },
  { key: "analyze", label: "Analyze Livesplit File" },
] as const;

export default function Home() {
  const [tab, setTab] = useState<Tab>("compare");

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-transparent">
      <header className="flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-3 relative">
        <Image
          src={bench}
          alt="Bench"
          style={{
            position: "absolute",
            left: "10px",
            top: "10px",
          }}
        />
        {/* Crop off the logo's top ornament; percentage margins scale with the wrapper width. */}
        <div className="w-full max-w-[26rem] overflow-hidden">
          <Image
            src={logo}
            alt="HK Split Analyzer"
            priority
            className="block h-auto w-full"
            style={{ marginTop: "-7.5%" }}
          />
        </div>
        <div className="absolute right-4 top-4">
          <Button
            size="sm"
            onClick={() =>
              window.open(
                "https://github.com/briank1727/hksplitanalyzer/blob/master/README.md",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            Help
          </Button>
        </div>
      </header>

      <Tabs
        tabs={TABS}
        active={tab}
        onChange={setTab}
        className="justify-center px-8"
      />

      <main className="flex flex-col flex-1">
        <div
          className={`flex flex-col flex-1 min-h-0 ${tab === "compare" ? "" : "hidden"}`}
        >
          <ComsobPage />
        </div>
        <div
          className={`flex flex-col flex-1 min-h-0 ${tab === "analyze" ? "" : "hidden"}`}
        >
          <AnalyzeLSSPage />
        </div>
      </main>
    </div>
  );
}
