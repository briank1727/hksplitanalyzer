import { XMLParser } from "fast-xml-parser";
import type { Timespan } from "@/lib/timespan";
import { TS_ZERO, tsSub } from "@/lib/timespan";

export type LiveSplit = {
  segments: Segment[];
};

export type Segment = {
  name: string;
  auto_split_name: string;
  split_times: SplitTime[];
  // Game times imported directly from the .lss segment:
  // manual_pb   = the "Personal Best" <SplitTime>'s <GameTime>
  // manual_gold = the <BestSegmentTime>'s <GameTime>
  manual_pb: Timespan;
  manual_gold: Timespan;
};

export type SplitTime = {
  id: number;
  game_time: Timespan;
  date: string | null;
};

type XmlNode = Record<string, unknown>;

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function readTimespan(value: unknown): Timespan {
  if (value == null) return TS_ZERO;
  const s = String(value).trim();
  return s === "" ? TS_ZERO : s;
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

  const attemptHistory = run.AttemptHistory as XmlNode | undefined;
  const attemptDateMap = new Map<number, string>();
  for (const attempt of toArray<XmlNode>(
    attemptHistory?.Attempt as XmlNode | XmlNode[] | undefined,
  )) {
    const id = Number(attempt["@_id"]);
    const started = String(attempt["@_started"] ?? "");
    if (started) {
      const [datePart] = started.split(" ");
      const [month, day, year] = datePart.split("/");
      attemptDateMap.set(id, `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    }
  }

  const segmentsContainer = run.Segments as XmlNode | undefined;
  const rawSegments = toArray<XmlNode>(
    segmentsContainer?.Segment as XmlNode | XmlNode[] | undefined,
  );
  // The "Personal Best" SplitTime is a cumulative split time (total elapsed at
  // that point in the run), so the per-segment time is its value minus the
  // previous segment's. BestSegmentTime, by contrast, is already a per-segment
  // duration and is used as-is.
  const pbCumulative: Timespan[] = rawSegments.map((seg) => {
    const splitTimesContainer = seg.SplitTimes as XmlNode | undefined;
    const pbSplitTime = toArray<XmlNode>(
      splitTimesContainer?.SplitTime as XmlNode | XmlNode[] | undefined,
    ).find((st) => st["@_name"] === "Personal Best");
    return readTimespan(pbSplitTime?.GameTime);
  });

  const segments: Segment[] = rawSegments.map((seg, i) => {
    const history = seg.SegmentHistory as XmlNode | undefined;
    const timeNodes = toArray<XmlNode>(
      history?.Time as XmlNode | XmlNode[] | undefined,
    );
    const split_times: SplitTime[] = timeNodes
      .map((t) => {
        const id = Number(t["@_id"]);
        return {
          id,
          game_time: readTimespan(t.GameTime),
          date: attemptDateMap.get(id) ?? null,
        };
      })
      .filter((st) => st.game_time !== TS_ZERO);

    const pbCurrent = pbCumulative[i];
    const manual_pb =
      pbCurrent === TS_ZERO || i === 0
        ? pbCurrent
        : tsSub(pbCurrent, pbCumulative[i - 1]);

    const bestSegmentTime = seg.BestSegmentTime as XmlNode | undefined;
    const manual_gold = readTimespan(bestSegmentTime?.GameTime);

    return {
      name: String(seg.Name ?? ""),
      auto_split_name: "",
      split_times,
      manual_pb,
      manual_gold,
    };
  });

  const custom = (run.AutoSplitterSettings as XmlNode | undefined)
    ?.CustomSettings as XmlNode | undefined;
  const customSettings = toArray<XmlNode>(
    custom?.Setting as XmlNode | XmlNode[] | undefined,
  );
  const splitsList = customSettings.find((s) => s["@_id"] === "splits");
  const splitStrings = toArray<XmlNode>(
    splitsList?.Setting as XmlNode | XmlNode[] | undefined,
  ).map((s) => String(s["@_value"] ?? ""));

  const splitOffset = Math.max(0, splitStrings.length - segments.length);
  segments.forEach((seg, i) => {
    seg.auto_split_name = splitStrings[i + splitOffset] ?? "";
  });

  return {
    // gameTitle: String(run.GameName ?? ""),
    // categoryName: String(run.CategoryName ?? ""),
    segments,
  };
}
