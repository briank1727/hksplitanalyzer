import type { Timespan } from "@/lib/timespan";

export type TimelineSegment = {
  name: string;
  auto_split_name: string;
  game_time: Timespan;
};

export type Timeline = {
  segments: TimelineSegment[];
};
