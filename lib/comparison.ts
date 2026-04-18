import type { LiveSplit } from "@/lib/lss_logic";
import type { TimingMethodKind } from "@/lib/timing_method";
import { TS_ZERO, tsAdd, tsAvg, tsCompare, tsToTicks } from "@/lib/timespan";

export type ComparisonKind = {
  name: string;
  generate_comparison: (ls: LiveSplit, tm: TimingMethodKind) => LiveSplit;
};

export const Comparison = {
  PersonalBest: {
    name: "Personal Best",
    generate_comparison(ls: LiveSplit, tm: TimingMethodKind): LiveSplit {
      const completedIds = new Set<number>();
      if (ls.segments.length > 0) {
        for (const st of ls.segments[0].split_times) completedIds.add(st.id);
        for (let i = 1; i < ls.segments.length; i++) {
          const segIds = new Set(ls.segments[i].split_times.map((s) => s.id));
          for (const id of [...completedIds]) {
            if (!segIds.has(id)) completedIds.delete(id);
          }
        }
      }

      let bestId = -1;
      let bestTotal = "";
      for (const id of completedIds) {
        let total = TS_ZERO;
        for (const seg of ls.segments) {
          const st = seg.split_times.find((s) => s.id === id);
          if (st) total = tsAdd(total, tm.time_of_split(st));
        }
        if (bestId === -1 || tsCompare(total, bestTotal) < 0) {
          bestTotal = total;
          bestId = id;
        }
      }
      if (bestId === -1) {
        throw new Error("PersonalBest: no run completed every segment");
      }

      return {
        ...ls,
        segments: ls.segments.map((seg) => ({
          ...seg,
          split_times: seg.split_times.filter((s) => s.id === bestId),
        })),
      };
    },
  },
  BestSegments: {
    name: "Best Segments",
    generate_comparison(ls: LiveSplit, tm: TimingMethodKind): LiveSplit {
      return {
        ...ls,
        segments: ls.segments.map((seg) => {
          const valid = seg.split_times.filter(
            (s) => tsToTicks(tm.time_of_split(s)) !== 0n,
          );
          if (valid.length === 0) return { ...seg, split_times: [] };
          const best = valid.reduce((a, b) =>
            tsCompare(tm.time_of_split(a), tm.time_of_split(b)) <= 0 ? a : b,
          );
          return { ...seg, split_times: [best] };
        }),
      };
    },
  },
  AverageSegments: {
    name: "Average Segments",
    generate_comparison(ls: LiveSplit, tm: TimingMethodKind): LiveSplit {
      return {
        ...ls,
        segments: ls.segments.map((seg) => {
          const valid = seg.split_times.filter(
            (s) => tsToTicks(tm.time_of_split(s)) !== 0n,
          );
          if (valid.length === 0) return { ...seg, split_times: [] };
          const real = tsAvg(valid.map((s) => s.real_time));
          const game = tsAvg(valid.map((s) => s.game_time));
          return {
            ...seg,
            split_times: [{ id: 0, real_time: real, game_time: game }],
          };
        }),
      };
    },
  },
} as const satisfies Record<string, ComparisonKind>;
