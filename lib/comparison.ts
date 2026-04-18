import type { LiveSplit } from "@/lib/lss_logic";
import type { TimingMethodKind } from "@/lib/timing_method";
import { TS_ZERO, tsAdd, tsAvg, tsCompare, tsToTicks } from "@/lib/timespan";

export type ComparisonKind = {
  name: string;
  generate_comparison: (
    ls: LiveSplit,
    tm: TimingMethodKind,
    bigSplits: boolean,
  ) => LiveSplit;
};

function compress_big_splits(ls: LiveSplit): LiveSplit {
  const result: typeof ls.segments = [];
  let i = 0;

  while (i < ls.segments.length) {
    const segment = ls.segments[i];

    if (segment.name.startsWith("-")) {
      // Skip dashed segments, they'll be handled when we encounter the next big split
      i++;
      continue;
    }

    // This is a big split, collect consecutive dashed segments before it
    const smallSplits: typeof ls.segments = [];
    let j = i - 1;
    while (j >= 0 && ls.segments[j].name.startsWith("-")) {
      smallSplits.unshift(ls.segments[j]);
      j--;
    }

    // Merge small splits with the big split
    const mergedSegment = { ...segment };

    if (smallSplits.length > 0) {
      const newSplitTimes: typeof segment.split_times = [];
      const ids = new Set<number>();

      // Get all IDs from the big split
      segment.split_times.forEach((st) => ids.add(st.id));

      // For each ID, sum times from all segments that have it
      for (const id of ids) {
        let real_time = TS_ZERO;
        let game_time = TS_ZERO;
        let found = false;

        // Sum from small splits if they have this ID
        for (const s of smallSplits) {
          const st = s.split_times.find((t) => t.id === id);
          if (st) {
            real_time = tsAdd(real_time, st.real_time);
            game_time = tsAdd(game_time, st.game_time);
            found = true;
          }
        }

        // Always add the big split's time
        const bigSt = segment.split_times.find((t) => t.id === id);
        if (bigSt) {
          real_time = tsAdd(real_time, bigSt.real_time);
          game_time = tsAdd(game_time, bigSt.game_time);
          found = true;
        }

        if (found) {
          newSplitTimes.push({ id, real_time, game_time });
        }
      }

      mergedSegment.split_times = newSplitTimes;
    }

    result.push(mergedSegment);
    i++;
  }

  return { ...ls, segments: result };
}

export const Comparison = {
  PersonalBest: {
    name: "Personal Best",
    generate_comparison(
      ls: LiveSplit,
      tm: TimingMethodKind,
      bigSplits: boolean,
    ): LiveSplit {
      if (bigSplits) ls = compress_big_splits(ls);
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
    generate_comparison(
      ls: LiveSplit,
      tm: TimingMethodKind,
      bigSplits: boolean,
    ): LiveSplit {
      if (bigSplits) ls = compress_big_splits(ls);
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
    generate_comparison(
      ls: LiveSplit,
      tm: TimingMethodKind,
      bigSplits: boolean,
    ): LiveSplit {
      if (bigSplits) ls = compress_big_splits(ls);
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
