import type { LiveSplit } from "@/lib/lss_logic";
import type { Timespan } from "@/lib/timespan";
import { TS_ZERO, tsAdd, tsAvg, tsCompare, tsToTicks } from "@/lib/timespan";
import type { Timeline } from "@/lib/timeline";

export type ComparisonKind = {
  name: string;
  generate_comparison: (
    ls: LiveSplit,
    bigSplits: boolean,
    manual_splits: boolean,
  ) => Timeline;
};

export class DiffTime {
  name: string;
  auto_split_name: string;
  time1: Timespan;
  time2: Timespan;

  constructor(name: string, auto_split_name: string, time1: Timespan, time2: Timespan) {
    this.name = name;
    this.auto_split_name = auto_split_name;
    this.time1 = time1;
    this.time2 = time2;
  }

  diff(): bigint {
    const t1 = tsToTicks(this.time1);
    const t2 = tsToTicks(this.time2);
    return t1 - t2;
  }

  percent(): number | null {
    const t1 = tsToTicks(this.time1);
    const t2 = tsToTicks(this.time2);
    if (t1 === 0n || t2 === 0n) return null;
    const diff = t1 - t2;
    return (Number(diff) / Number(t2)) * 100;
  }
}

type DiffSortByKind = {
  name: string;
  sort(rows: DiffTime[]): DiffTime[];
};

export const DiffSortBy = {
  Order: {
    name: "Order",
    sort(rows: DiffTime[]): DiffTime[] {
      return rows;
    },
  } as DiffSortByKind,
  Name: {
    name: "Name",
    sort(rows: DiffTime[]): DiffTime[] {
      return [...rows]
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          const cmp = a.row.name.localeCompare(b.row.name);
          return cmp !== 0 ? cmp : a.index - b.index;
        })
        .map(({ row }) => row);
    },
  } as DiffSortByKind,
  Comparison1: {
    name: "Comparison 1",
    sort(rows: DiffTime[]): DiffTime[] {
      return [...rows]
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          const aVal = tsToTicks(a.row.time1);
          const bVal = tsToTicks(b.row.time1);
          if (aVal < bVal) return -1;
          if (aVal > bVal) return 1;
          return a.index - b.index;
        })
        .map(({ row }) => row);
    },
  } as DiffSortByKind,
  Comparison2: {
    name: "Comparison 2",
    sort(rows: DiffTime[]): DiffTime[] {
      return [...rows]
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          const aVal = tsToTicks(a.row.time2);
          const bVal = tsToTicks(b.row.time2);
          if (aVal < bVal) return -1;
          if (aVal > bVal) return 1;
          return a.index - b.index;
        })
        .map(({ row }) => row);
    },
  } as DiffSortByKind,
  Diff: {
    name: "Diff",
    sort(rows: DiffTime[]): DiffTime[] {
      return [...rows]
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          const aVal = a.row.diff();
          const bVal = b.row.diff();
          if (aVal < bVal) return -1;
          if (aVal > bVal) return 1;
          return a.index - b.index;
        })
        .map(({ row }) => row);
    },
  } as DiffSortByKind,
  Percent: {
    name: "Percent",
    sort(rows: DiffTime[]): DiffTime[] {
      return [...rows]
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          const aVal = a.row.percent();
          const bVal = b.row.percent();
          if (aVal === null && bVal === null) return a.index - b.index;
          if (aVal === null) return 1;
          if (bVal === null) return -1;
          if (aVal < bVal) return -1;
          if (aVal > bVal) return 1;
          return a.index - b.index;
        })
        .map(({ row }) => row);
    },
  } as DiffSortByKind,
} as const satisfies Record<string, DiffSortByKind>;

function compress_big_splits(ls: LiveSplit): LiveSplit {
  const result: typeof ls.segments = [];
  let i = 0;

  while (i < ls.segments.length) {
    const segment = ls.segments[i];

    if (segment.name.startsWith("-")) {
      i++;
      continue;
    }

    const smallSplits: typeof ls.segments = [];
    let j = i - 1;
    while (j >= 0 && ls.segments[j].name.startsWith("-")) {
      smallSplits.unshift(ls.segments[j]);
      j--;
    }

    const mergedSegment = { ...segment };

    if (smallSplits.length > 0) {
      // The merged manual times are the sum of the sub-segment manual times
      // (the big split itself plus its preceding "-" small splits).
      for (const s of smallSplits) {
        mergedSegment.manual_pb = tsAdd(mergedSegment.manual_pb, s.manual_pb);
        mergedSegment.manual_gold = tsAdd(mergedSegment.manual_gold, s.manual_gold);
      }

      const newSplitTimes: typeof segment.split_times = [];
      const ids = new Set<number>();

      segment.split_times.forEach((st) => ids.add(st.id));

      for (const id of ids) {
        let game_time = TS_ZERO;
        let found = false;

        for (const s of smallSplits) {
          const st = s.split_times.find((t) => t.id === id);
          if (st) {
            game_time = tsAdd(game_time, st.game_time);
            found = true;
          }
        }

        const bigSt = segment.split_times.find((t) => t.id === id);
        if (bigSt) {
          game_time = tsAdd(game_time, bigSt.game_time);
          found = true;
        }

        if (found) {
          newSplitTimes.push({ id, game_time, date: bigSt?.date ?? null });
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
      bigSplits: boolean,
      manual_splits: boolean,
    ): Timeline {
      if (bigSplits) ls = compress_big_splits(ls);
      if (manual_splits) {
        return {
          segments: ls.segments.map((seg) => ({
            name: seg.name,
            auto_split_name: seg.auto_split_name,
            game_time: seg.manual_pb,
          })),
        };
      }
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
          if (st) total = tsAdd(total, st.game_time);
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
        segments: ls.segments.map((seg) => ({
          name: seg.name,
          auto_split_name: seg.auto_split_name,
          game_time: seg.split_times.find((s) => s.id === bestId)?.game_time ?? TS_ZERO,
        })),
      };
    },
  },
  BestSegments: {
    name: "Best Segments",
    generate_comparison(
      ls: LiveSplit,
      bigSplits: boolean,
      manual_splits: boolean,
    ): Timeline {
      if (bigSplits) ls = compress_big_splits(ls);
      if (manual_splits) {
        return {
          segments: ls.segments.map((seg) => ({
            name: seg.name,
            auto_split_name: seg.auto_split_name,
            game_time: seg.manual_gold,
          })),
        };
      }
      return {
        segments: ls.segments.map((seg) => {
          const valid = seg.split_times.filter(
            (s) => tsToTicks(s.game_time) !== 0n,
          );
          if (valid.length === 0) {
            return { name: seg.name, auto_split_name: seg.auto_split_name, game_time: TS_ZERO };
          }
          const best = valid.reduce((a, b) =>
            tsCompare(a.game_time, b.game_time) <= 0 ? a : b,
          );
          return { name: seg.name, auto_split_name: seg.auto_split_name, game_time: best.game_time };
        }),
      };
    },
  },
  AverageSegments: {
    name: "Average Segments",
    generate_comparison(ls: LiveSplit, bigSplits: boolean): Timeline {
      if (bigSplits) ls = compress_big_splits(ls);
      return {
        segments: ls.segments.map((seg) => {
          const valid = seg.split_times.filter(
            (s) => tsToTicks(s.game_time) !== 0n,
          );
          if (valid.length === 0) {
            return { name: seg.name, auto_split_name: seg.auto_split_name, game_time: TS_ZERO };
          }
          const game = tsAvg(valid.map((s) => s.game_time));
          return { name: seg.name, auto_split_name: seg.auto_split_name, game_time: game };
        }),
      };
    },
  },
} as const satisfies Record<string, ComparisonKind>;
