import { DiffTime } from "@/lib/comparison";
import {
  diffBgStyle,
  formatDiff,
  formatPercent,
  percentBgStyle,
} from "@/lib/diff_format";
import { formatTsDisplay } from "@/lib/timespan";

export default function SplitsCompareTable({
  sortedRows,
  diffThresholdMs,
}: {
  sortedRows: DiffTime[];
  diffThresholdMs: number;
}) {
  return (
    <div className="flex-1 min-w-0 max-h-[60vh] overflow-auto rounded bg-[#2a1f3d] text-zinc-100 text-base">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-zinc-300">
            <th className="text-left font-semibold px-2 py-1.5">Name</th>
            <th className="text-right font-semibold px-2 py-1.5">T1</th>
            <th className="text-right font-semibold px-2 py-1.5">T2</th>
            <th className="text-right font-semibold px-2 py-1.5">+/-</th>
            <th className="text-right font-semibold px-2 py-1.5">%</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 last:border-b-0">
              <td className="text-left px-2 py-1">{row.name}</td>
              <td className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap">
                {formatTsDisplay(row.time1)}
              </td>
              <td className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap">
                {formatTsDisplay(row.time2)}
              </td>
              <td
                style={diffBgStyle(row.diff(), diffThresholdMs)}
                className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap"
              >
                {formatDiff(row.diff())}
              </td>
              <td
                style={percentBgStyle(row.percent())}
                className="text-right px-2 py-1 tabular-nums font-semibold whitespace-nowrap"
              >
                {formatPercent(row.percent())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
