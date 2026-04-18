import type { SplitTime } from "@/lib/lss_logic";
import type { Timespan } from "@/lib/timespan";

export type TimingMethodKind = {
  name: string;
  time_of_split: (st: SplitTime) => Timespan;
};

export const TimingMethod = {
  GameTime: {
    name: "Game Time",
    time_of_split(st: SplitTime): Timespan {
      return st.game_time;
    },
  },
  RealTime: {
    name: "Real Time",
    time_of_split(st: SplitTime): Timespan {
      return st.real_time;
    },
  },
} as const satisfies Record<string, TimingMethodKind>;
