import { formatTsDisplay, ticksToTs } from "@/lib/timespan";

export function formatDiff(ticks: bigint): string {
  if (ticks === 0n) return formatTsDisplay(ticksToTs(0n));
  const sign = ticks > 0n ? "+" : "-";
  const abs = ticks < 0n ? -ticks : ticks;
  return sign + formatTsDisplay(ticksToTs(abs));
}

export function formatPercent(p: number): string {
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(2)}%`;
}

const PERCENT_FULL_INTENSITY = 20;

export function percentBgStyle(p: number | null): { backgroundColor?: string } {
  if (p === null || p === 0) return {};
  const t = Math.min(Math.abs(p) / PERCENT_FULL_INTENSITY, 1);
  const lerp = (a: number, b: number) => a + (b - a) * t;
  // light → dark, with alpha also ramping up so the dark bg still shows through low magnitudes
  const [from, to] =
    p > 0
      ? [
          [255, 170, 170], // red-200
          [200, 20, 20], //   red-900
        ]
      : [
          [187, 247, 208], // green-200
          [20, 83, 45], //    green-900
        ];
  const r = Math.round(lerp(from[0], to[0]));
  const g = Math.round(lerp(from[1], to[1]));
  const b = Math.round(lerp(from[2], to[2]));
  const a = lerp(0.35, 0.9).toFixed(3);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` };
}

export function diffBgStyle(
  ticks: bigint | null,
  maxMs: number,
): { backgroundColor?: string } {
  if (ticks === null || ticks === 0n || maxMs === 0) return {};
  // Convert ticks to milliseconds (10000 ticks = 1ms)
  const ms = Number(ticks < 0n ? -ticks : ticks) / 10000;
  const t = Math.min(ms / maxMs, 1);
  const lerp = (a: number, b: number) => a + (b - a) * t;
  // light → dark, with alpha also ramping up so the dark bg still shows through low magnitudes
  const [from, to] =
    ticks > 0n
      ? [
          [255, 170, 170], // red-200
          [200, 20, 20], //   red-900
        ]
      : [
          [187, 247, 208], // green-200
          [20, 83, 45], //    green-900
        ];
  const r = Math.round(lerp(from[0], to[0]));
  const g = Math.round(lerp(from[1], to[1]));
  const b = Math.round(lerp(from[2], to[2]));
  const a = lerp(0.35, 0.9).toFixed(3);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` };
}
