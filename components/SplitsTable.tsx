"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Timeline, TimelineSegment } from "@/lib/timeline";
import type { Timespan } from "@/lib/timespan";
import { TS_ZERO, formatTsDisplay, tsAdd } from "@/lib/timespan";

function parseGameTime(input: string): Timespan | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:\.(\d+))?$/);
  if (!match) return null;
  const hours = match[1] !== undefined ? parseInt(match[1], 10) : 0;
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  if (minutes > 59 || seconds > 59) return null;
  const hStr = hours.toString().padStart(2, "0");
  const mStr = minutes.toString().padStart(2, "0");
  const sStr = seconds.toString().padStart(2, "0");
  const fracPart = match[4] ? `.${match[4]}` : "";
  return `${hStr}:${mStr}:${sStr}${fracPart}`;
}

const INPUT_BASE =
  "w-full bg-transparent outline-none border border-zinc-700/50 rounded px-1 -mx-1 " +
  "hover:border-zinc-500 hover:bg-zinc-800/50 focus:border-zinc-400 focus:bg-zinc-800 transition-colors cursor-text";

type SegmentRowProps = {
  seg: TimelineSegment;
  index: number;
  cumTime: Timespan | null;
  setTimeline: Dispatch<SetStateAction<Timeline | null>>;
};

function SegmentRow({ seg, index, cumTime, setTimeline }: SegmentRowProps) {
  const [nameDraft, setNameDraft] = useState(seg.name);
  const [autoSplitDraft, setAutoSplitDraft] = useState(seg.auto_split_name);
  const [gameTimeDraft, setGameTimeDraft] = useState(formatTsDisplay(seg.game_time));
  const [gameTimeInvalid, setGameTimeInvalid] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const autoSplitRef = useRef<HTMLInputElement>(null);
  const gameTimeRef = useRef<HTMLInputElement>(null);

  // Sync draft state when seg changes externally (new timeline loaded).
  // Skip whichever field currently has focus so in-progress typing is never clobbered.
  useEffect(() => {
    if (document.activeElement !== nameRef.current) setNameDraft(seg.name);
    if (document.activeElement !== autoSplitRef.current) setAutoSplitDraft(seg.auto_split_name);
    if (document.activeElement !== gameTimeRef.current) {
      setGameTimeDraft(formatTsDisplay(seg.game_time));
      setGameTimeInvalid(false);
    }
  }, [seg]);

  function commitName(value: string) {
    setTimeline((prev) => {
      if (!prev) return prev;
      const segments = [...prev.segments];
      segments[index] = { ...segments[index], name: value };
      return { ...prev, segments };
    });
  }

  function commitAutoSplit(value: string) {
    setTimeline((prev) => {
      if (!prev) return prev;
      const segments = [...prev.segments];
      segments[index] = { ...segments[index], auto_split_name: value };
      return { ...prev, segments };
    });
  }

  function handleGameTimeBlur(value: string) {
    const parsed = parseGameTime(value);
    if (parsed === null) {
      setGameTimeDraft(formatTsDisplay(seg.game_time));
      setGameTimeInvalid(true);
      return;
    }
    setGameTimeInvalid(false);
    setGameTimeDraft(formatTsDisplay(parsed));
    setTimeline((prev) => {
      if (!prev) return prev;
      const segments = [...prev.segments];
      segments[index] = { ...segments[index], game_time: parsed };
      return { ...prev, segments };
    });
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_6rem_6rem] gap-x-3 px-2 py-1 border-b border-white/5 last:border-b-0">
      <input
        ref={nameRef}
        type="text"
        value={nameDraft}
        className={`${INPUT_BASE} truncate`}
        onChange={(e) => setNameDraft(e.target.value)}
        onBlur={(e) => commitName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      <input
        ref={autoSplitRef}
        type="text"
        value={autoSplitDraft}
        className={`${INPUT_BASE} truncate text-zinc-400`}
        onChange={(e) => setAutoSplitDraft(e.target.value)}
        onBlur={(e) => commitAutoSplit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      <input
        ref={gameTimeRef}
        type="text"
        value={gameTimeDraft}
        className={`${INPUT_BASE} tabular-nums font-semibold ${
          gameTimeInvalid
            ? "border-red-500 bg-red-950/30 focus:border-red-500 focus:bg-red-950/30"
            : ""
        }`}
        onChange={(e) => setGameTimeDraft(e.target.value)}
        onFocus={() => setGameTimeInvalid(false)}
        onBlur={(e) => handleGameTimeBlur(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      <div className="text-left tabular-nums font-semibold self-center">
        {cumTime !== null ? formatTsDisplay(cumTime) : ""}
      </div>
    </div>
  );
}

export default function SplitsTable({
  timeline,
  setTimeline,
  error,
  errorTitle,
}: {
  timeline: Timeline | null;
  setTimeline: Dispatch<SetStateAction<Timeline | null>>;
  error: string | null;
  errorTitle: string;
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="mt-4 text-sm rounded p-3 border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
      >
        <div className="font-semibold">{errorTitle}</div>
        <div className="mt-1 break-words">{error}</div>
      </div>
    );
  }
  if (!timeline) return null;

  const times: (Timespan | null)[] = [];
  for (let i = 0; i < timeline.segments.length; i++) {
    const seg = timeline.segments[i];
    const prev = i === 0 ? TS_ZERO : times[i - 1];
    times.push(prev !== null ? tsAdd(prev, seg.game_time) : null);
  }

  return (
    <div className="mt-3 max-h-[60vh] overflow-auto rounded bg-gray-900 text-zinc-100 text-base">
      <div className="grid grid-cols-[1fr_1fr_6rem_6rem] gap-x-3 px-2 py-1.5 border-b border-white/10 font-semibold text-zinc-300">
        <div>Name</div>
        <div>Auto Split</div>
        <div className="text-left">Segment</div>
        <div className="text-left">Time</div>
      </div>
      {timeline.segments.map((seg, i) => (
        <SegmentRow
          key={i}
          seg={seg}
          index={i}
          cumTime={times[i]}
          setTimeline={setTimeline}
        />
      ))}
    </div>
  );
}
