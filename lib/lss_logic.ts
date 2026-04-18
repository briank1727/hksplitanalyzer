import { XMLParser } from "fast-xml-parser";

export type LiveSplit = {
  gameTitle: string;
  categoryName: string;
  offset: number;
  segments: Segment[];
};

export type Segment = {
  name: string;
  auto_split_name: string;
  split_times: SplitTime[];
};

export type SplitTime = {
  id: number;
  real_time: number;
  game_time: number;
};

type XmlNode = Record<string, unknown>;

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function parseTimeSpan(value: unknown): number {
  if (value == null) return 0;
  const s = String(value).trim();
  if (s === "") return 0;
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  const parts = body.split(":");
  if (parts.length !== 3) return 0;
  const [h, m, rest] = parts;
  const total = Number(h) * 3600 + Number(m) * 60 + parseFloat(rest);
  if (!Number.isFinite(total)) return 0;
  return neg ? -total : total;
}

export function parse_lss(contents: string): LiveSplit {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: false,
    parseTagValue: false,
    trimValues: true,
  });
  const doc = parser.parse(contents) as XmlNode;
  const run = doc.Run as XmlNode | undefined;
  if (!run) throw new Error("parse_lss: missing <Run> element");

  const segmentsContainer = run.Segments as XmlNode | undefined;
  const rawSegments = toArray<XmlNode>(segmentsContainer?.Segment as XmlNode | XmlNode[] | undefined);
  const segments: Segment[] = rawSegments.map((seg) => {
    const history = seg.SegmentHistory as XmlNode | undefined;
    const timeNodes = toArray<XmlNode>(history?.Time as XmlNode | XmlNode[] | undefined);
    const split_times: SplitTime[] = timeNodes.map((t) => ({
      id: Number(t["@_id"]),
      real_time: parseTimeSpan(t.RealTime),
      game_time: parseTimeSpan(t.GameTime),
    }));
    return {
      name: String(seg.Name ?? ""),
      auto_split_name: "",
      split_times,
    };
  });

  const custom = (run.AutoSplitterSettings as XmlNode | undefined)?.CustomSettings as
    | XmlNode
    | undefined;
  const customSettings = toArray<XmlNode>(custom?.Setting as XmlNode | XmlNode[] | undefined);
  const splitsList = customSettings.find((s) => s["@_id"] === "splits");
  const splitStrings = toArray<XmlNode>(
    splitsList?.Setting as XmlNode | XmlNode[] | undefined,
  ).map((s) => String(s["@_value"] ?? ""));

  const splitOffset = Math.max(0, splitStrings.length - segments.length);
  segments.forEach((seg, i) => {
    seg.auto_split_name = splitStrings[i + splitOffset] ?? "";
  });

  return {
    gameTitle: String(run.GameName ?? ""),
    categoryName: String(run.CategoryName ?? ""),
    offset: parseTimeSpan(run.Offset),
    segments,
  };
}

export type ComparisonKind = {
  name: string;
  generate_comparison: (ls: LiveSplit) => LiveSplit;
};

export const Comparison = {
  PersonalBest: {
    name: "Personal Best",
    generate_comparison(ls: LiveSplit): LiveSplit {
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
      let bestTotal = Infinity;
      for (const id of completedIds) {
        let total = 0;
        for (const seg of ls.segments) {
          const st = seg.split_times.find((s) => s.id === id);
          if (st) total += st.real_time;
        }
        if (total < bestTotal) {
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
    generate_comparison(ls: LiveSplit): LiveSplit {
      return {
        ...ls,
        segments: ls.segments.map((seg) => {
          if (seg.split_times.length === 0) return { ...seg, split_times: [] };
          const best = seg.split_times.reduce((a, b) =>
            a.real_time <= b.real_time ? a : b,
          );
          return { ...seg, split_times: [best] };
        }),
      };
    },
  },
  AverageSegments: {
    name: "Average Segments",
    generate_comparison(ls: LiveSplit): LiveSplit {
      return {
        ...ls,
        segments: ls.segments.map((seg) => {
          const n = seg.split_times.length;
          if (n === 0) return { ...seg, split_times: [] };
          const real =
            seg.split_times.reduce((sum, s) => sum + s.real_time, 0) / n;
          const game =
            seg.split_times.reduce((sum, s) => sum + s.game_time, 0) / n;
          return {
            ...seg,
            split_times: [{ id: 0, real_time: real, game_time: game }],
          };
        }),
      };
    },
  },
} as const satisfies Record<string, ComparisonKind>;
