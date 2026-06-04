import type { Timeline } from "@/lib/timeline";
import { TS_ZERO, formatTsDisplay, tsAdd, type Timespan } from "@/lib/timespan";

export default function SplitsTable({
  data,
  error,
  errorTitle,
}: {
  data: Timeline | null;
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
  if (!data) return null;

  const times: (Timespan | null)[] = [];
  for (let i = 0; i < data.segments.length; i++) {
    const seg = data.segments[i];
    const prev = i === 0 ? TS_ZERO : times[i - 1];
    times.push(prev !== null ? tsAdd(prev, seg.game_time) : null);
  }

  return (
    <div className="mt-3 max-h-[60vh] overflow-auto rounded bg-gray-900 text-zinc-100 text-base">
      <div className="grid grid-cols-[1fr_1fr_6rem_6rem] gap-x-3 px-2 py-1.5 border-b border-white/10 font-semibold text-zinc-300">
        <div>Name</div>
        <div>Auto Split</div>
        <div className="text-left">Time</div>
        <div className="text-left">Segment</div>
      </div>
      {data.segments.map((seg, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_1fr_6rem_6rem] gap-x-3 px-2 py-1 border-b border-white/5 last:border-b-0"
        >
          <div className="truncate">{seg.name}</div>
          <div className="truncate text-zinc-400">{seg.auto_split_name}</div>
          <div className="text-left tabular-nums font-semibold">
            {times[i] !== null ? formatTsDisplay(times[i] as Timespan) : ""}
          </div>
          <div className="text-left tabular-nums font-semibold">
            {formatTsDisplay(seg.game_time)}
          </div>
        </div>
      ))}
    </div>
  );
}
