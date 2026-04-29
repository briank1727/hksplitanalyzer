"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PieChart, Pie, Tooltip } from "recharts";
import { formatTsDisplay, ticksToTs } from "@/lib/timespan";

export type SplitPieSlice = {
  name: string;
  time: number;
};

type SliceDatum = SplitPieSlice & { percent: number; fill: string };

// Deterministic, visually distinct colors via golden-angle spacing.
function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

const defaultFormatValue = (v: number): string =>
  formatTsDisplay(ticksToTs(BigInt(Math.round(v * 10000))));

function CustomTooltip({
  active,
  payload,
  valueLabel,
  formatValue,
}: {
  active?: boolean;
  payload?: { payload: SliceDatum }[];
  valueLabel: string;
  formatValue: (v: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;
  return (
    <div className="rounded border border-black/10 bg-white px-3 py-2 text-sm shadow dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50">
      <div className="font-semibold">{slice.name}</div>
      <div className="tabular-nums">
        {valueLabel}: {formatValue(slice.time)}
      </div>
      <div className="tabular-nums">{slice.percent.toFixed(2)}%</div>
    </div>
  );
}

export default function SplitPieChart({
  slices,
  height = 400,
  valueLabel = "Time",
  formatValue = defaultFormatValue,
}: {
  slices: SplitPieSlice[];
  height?: number;
  valueLabel?: string;
  formatValue?: (v: number) => string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    setChartWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setChartWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = useMemo<SliceDatum[]>(() => {
    const total = slices.reduce((sum, s) => sum + s.time, 0);
    return slices.map((s, i) => ({
      ...s,
      percent: total > 0 ? (s.time / total) * 100 : 0,
      fill: generateColor(i),
    }));
  }, [slices]);

  return (
    <div className="flex gap-4" style={{ height }}>
      <div ref={chartRef} className="flex-1 min-w-0">
        {chartWidth > 0 && (
          <PieChart width={chartWidth} height={height}>
            <Pie
              data={data}
              dataKey="time"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="27%"
              outerRadius="80%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            />
            <Tooltip
              content={
                <CustomTooltip
                  valueLabel={valueLabel}
                  formatValue={formatValue}
                />
              }
            />
          </PieChart>
        )}
      </div>
      <ul className="w-48 shrink-0 overflow-y-auto text-sm text-black dark:text-zinc-50 space-y-1 pr-1">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="truncate" title={entry.name}>
              {entry.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
