// LiveSplit stores times as .NET TimeSpan strings: "[-][d.]HH:MM:SS[.fffffff]"
// We preserve them as-is and only convert to BigInt ticks (100ns units) for arithmetic.

export type Timespan = string;

const TICKS_PER_SECOND = 10_000_000n;
const TICKS_PER_MINUTE = 60n * TICKS_PER_SECOND;
const TICKS_PER_HOUR = 60n * TICKS_PER_MINUTE;
const TICKS_PER_DAY = 24n * TICKS_PER_HOUR;
const TICKS_PER_HUNDREDTH = 100_000n;

export const TS_ZERO: Timespan = "00:00:00";

export function tsToTicks(s: Timespan | null | undefined): bigint {
  if (s == null) return 0n;
  const trimmed = s.trim();
  if (trimmed === "") return 0n;
  const neg = trimmed.startsWith("-");
  const body = neg ? trimmed.slice(1) : trimmed;
  const firstColon = body.indexOf(":");
  if (firstColon === -1) return 0n;
  const firstDot = body.indexOf(".");
  let days = 0n;
  let timePart = body;
  if (firstDot !== -1 && firstDot < firstColon) {
    days = BigInt(body.slice(0, firstDot));
    timePart = body.slice(firstDot + 1);
  }
  const parts = timePart.split(":");
  if (parts.length !== 3) return 0n;
  const [hStr, mStr, sFull] = parts;
  const fracDot = sFull.indexOf(".");
  const sIntStr = fracDot === -1 ? sFull : sFull.slice(0, fracDot);
  const fracStr = fracDot === -1 ? "" : sFull.slice(fracDot + 1);
  const fracPadded = (fracStr + "0000000").slice(0, 7);
  const fracTicks = fracPadded === "" ? 0n : BigInt(fracPadded);
  const ticks =
    days * TICKS_PER_DAY +
    BigInt(hStr) * TICKS_PER_HOUR +
    BigInt(mStr) * TICKS_PER_MINUTE +
    BigInt(sIntStr) * TICKS_PER_SECOND +
    fracTicks;
  return neg ? -ticks : ticks;
}

export function ticksToTs(ticks: bigint): Timespan {
  const neg = ticks < 0n;
  let abs = neg ? -ticks : ticks;
  const days = abs / TICKS_PER_DAY;
  abs = abs % TICKS_PER_DAY;
  const hours = abs / TICKS_PER_HOUR;
  abs = abs % TICKS_PER_HOUR;
  const minutes = abs / TICKS_PER_MINUTE;
  abs = abs % TICKS_PER_MINUTE;
  const seconds = abs / TICKS_PER_SECOND;
  const frac = abs % TICKS_PER_SECOND;
  const dayPart = days > 0n ? `${days.toString()}.` : "";
  const body = `${dayPart}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${frac.toString().padStart(7, "0")}`;
  return neg ? `-${body}` : body;
}

export function tsAdd(a: Timespan, b: Timespan): Timespan {
  return ticksToTs(tsToTicks(a) + tsToTicks(b));
}

export function tsSub(a: Timespan, b: Timespan): Timespan {
  return ticksToTs(tsToTicks(a) - tsToTicks(b));
}

export function tsCompare(a: Timespan, b: Timespan): number {
  const ta = tsToTicks(a);
  const tb = tsToTicks(b);
  if (ta < tb) return -1;
  if (ta > tb) return 1;
  return 0;
}

export function tsAvg(values: Timespan[]): Timespan {
  if (values.length === 0) return TS_ZERO;
  let sum = 0n;
  for (const v of values) sum += tsToTicks(v);
  const n = BigInt(values.length);
  const q = sum / n;
  const r = sum % n;
  const absR2 = r < 0n ? -r * 2n : r * 2n;
  let rounded = q;
  if (absR2 >= n) rounded += sum < 0n ? -1n : 1n;
  return ticksToTs(rounded);
}

// Render as "M:SS.ff" or "H:MM:SS.ff" (LiveSplit-style), rounded to a hundredth.
export function formatTsDisplay(ts: Timespan): string {
  let ticks = tsToTicks(ts);
  const half = TICKS_PER_HUNDREDTH / 2n;
  ticks =
    ticks >= 0n
      ? ((ticks + half) / TICKS_PER_HUNDREDTH) * TICKS_PER_HUNDREDTH
      : ((ticks - half) / TICKS_PER_HUNDREDTH) * TICKS_PER_HUNDREDTH;
  const neg = ticks < 0n;
  let abs = neg ? -ticks : ticks;
  const totalSeconds = abs / TICKS_PER_SECOND;
  const fracHundredths = (abs % TICKS_PER_SECOND) / TICKS_PER_HUNDREDTH;
  const hours = totalSeconds / 3600n;
  const minutes = (totalSeconds % 3600n) / 60n;
  const seconds = totalSeconds % 60n;
  const fracStr = `.${fracHundredths.toString().padStart(2, "0")}`;
  const sign = neg ? "-" : "";
  if (hours > 0n) {
    return `${sign}${hours.toString()}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}${fracStr}`;
  }
  return `${sign}${minutes.toString()}:${seconds.toString().padStart(2, "0")}${fracStr}`;
}

// Format time strings in various formats (HH:MM:SS, MM:SS, H:MM:SS, etc.) into standard Timespan format
export function formatTimespan(timeStr: string): Timespan {
  if (!timeStr || timeStr.trim() === "") return TS_ZERO;

  const trimmed = timeStr.trim();
  const parts = trimmed.split(":");

  // Handle HH:MM:SS or H:MM:SS or M:SS formats
  if (parts.length === 3) {
    // HH:MM:SS[.fffffff] format
    const [hours, minutes, secondsPart] = parts;
    const h = hours.padStart(2, "0");
    const m = minutes.padStart(2, "0");
    const s = secondsPart.padStart(2, "0");
    return `${h}:${m}:${s}` as Timespan;
  } else if (parts.length === 2) {
    // MM:SS format (no hours)
    const [minutes, seconds] = parts;
    const h = "00";
    const m = minutes.padStart(2, "0");
    const s = seconds.padStart(2, "0");
    return `${h}:${m}:${s}` as Timespan;
  }

  // Fallback to zero if format is unrecognized
  return TS_ZERO;
}
