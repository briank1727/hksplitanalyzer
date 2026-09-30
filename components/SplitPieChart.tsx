"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PieChart, Pie, Tooltip } from "recharts";
import Panel, { POPUP_PANEL_COLOR } from "@/components/Panel";
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
    <Panel
      color={POPUP_PANEL_COLOR}
      className="px-3! py-2! text-sm text-zinc-50"
    >
      <div className="font-semibold">{slice.name}</div>
      <div className="tabular-nums">
        {valueLabel}: {formatValue(slice.time)}
      </div>
      <div className="tabular-nums">{slice.percent.toFixed(2)}%</div>
    </Panel>
  );
}

export default function SplitPieChart({
  slices,
  height,
  valueLabel = "Time",
  formatValue = defaultFormatValue,
}: {
  slices: SplitPieSlice[];
  // Fixed height in px; omit to fill the parent's height.
  height?: number;
  valueLabel?: string;
  formatValue?: (v: number) => string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setChartSize({ width: rect.width, height: rect.height });
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setChartSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // With no fixed height the chart fills its container's height instead.
  const chartHeight = height ?? chartSize.height;

  const data = useMemo<SliceDatum[]>(() => {
    const total = slices.reduce((sum, s) => sum + s.time, 0);
    return slices.map((s, i) => ({
      ...s,
      percent: total > 0 ? (s.time / total) * 100 : 0,
      fill: generateColor(i),
    }));
  }, [slices]);

  return (
    <div
      className={`flex gap-4 ${height === undefined ? "h-full" : ""}`}
      style={height === undefined ? undefined : { height }}
    >
      <div ref={chartRef} className="flex-1 min-w-0">
        {chartSize.width > 0 && chartHeight > 0 && (
          <PieChart width={chartSize.width} height={chartHeight}>
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
              isAnimationActive={false}
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
      <ul className="w-48 shrink-0 overflow-y-auto text-sm text-zinc-50 space-y-1 pr-1">
        {data
          .filter((entry) => entry.percent > 0)
          .map((entry, i) => (
            <li key={i} className="flex items-center gap-2">
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
