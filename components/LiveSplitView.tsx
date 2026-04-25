import { type LiveSplit } from "@/lib/lss_logic";
import { TimingMethod } from "@/lib/timing_method";
import { TS_ZERO, formatTsDisplay, tsAdd, type Timespan } from "@/lib/timespan";

type TimingMethodKey = keyof typeof TimingMethod;

export default function LiveSplitView({
  data,
  error,
  errorTitle,
  timingMethod,
}: {
  data: LiveSplit | null;
  error: string | null;
  errorTitle: string;
  timingMethod: TimingMethodKey;
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

  const tm = TimingMethod[timingMethod];
  const segmentDeltas: (Timespan | null)[] = data.segments.map((seg) =>
    seg.split_times.length === 1 ? tm.time_of_split(seg.split_times[0]) : null,
  );
  const times: (Timespan | null)[] = [];
  for (let i = 0; i < segmentDeltas.length; i++) {
    const seg = segmentDeltas[i];
    const prev = i === 0 ? TS_ZERO : times[i - 1];
    times.push(seg !== null && prev !== null ? tsAdd(prev, seg) : null);
  }

  return (
    <div className="mt-3 max-h-[60vh] overflow-auto rounded bg-[#2a1f3d] text-zinc-100 text-xs">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-2 py-1.5 border-b border-white/10 font-semibold text-zinc-300">
        <div></div>
        <div className="text-right">Time</div>
        <div className="text-right">Segment</div>
      </div>
      {data.segments.map((seg, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-2 py-1 border-b border-white/5 last:border-b-0"
        >
          <div className="truncate">{seg.name}</div>
          <div className="text-right tabular-nums font-semibold">
            {times[i] !== null ? formatTsDisplay(times[i] as Timespan) : ""}
          </div>
          <div className="text-right tabular-nums font-semibold">
            {segmentDeltas[i] !== null
              ? formatTsDisplay(segmentDeltas[i] as Timespan)
              : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
