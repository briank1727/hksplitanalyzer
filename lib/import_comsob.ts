import { formatTimespan } from "@/lib/timespan";
import { Timeline, TimelineSegment } from "./timeline";
import hkComsobData from "./hk_comsob_data.json";
import silksongComsobData from "./silksong_comsob_data.json";

type ExtractCellsResult =
  | { success: true; data: string[][] }
  | { success: false; error: string };

type FetchComsobResult =
  | { success: true; data: Timeline }
  | { success: false; error: string };

async function extract_cells(
  topLeftCell: string,
  bottomRightCell: string,
  sheetUrl: string,
): Promise<ExtractCellsResult> {
  try {
    // Call the backend API endpoint instead of fetching directly
    const response = await fetch("/api/extract-cells", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topLeftCell, bottomRightCell, sheetUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to extract cells" };
    }

    if (!data.success || !data.data) {
      return { success: false, error: "Invalid response from server" };
    }

    return { success: true, data: data.data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

function csv_to_timeline(
  data: string[][],
  splitNamesIdx: number,
  autoSplitNamesIdx: number,
  gameTimesIdx: number,
): Timeline {
  if (data.length === 0) {
    throw new Error("CSV data must contain at least one segment");
  }

  // Process all rows (no header row)
  const segments: TimelineSegment[] = data.map((row) => ({
    name: row[splitNamesIdx] || "Unknown",
    auto_split_name: row[autoSplitNamesIdx] || "",
    game_time: formatTimespan(row[gameTimesIdx] || ""),
  }));

  return { segments };
}

export function fetch_comsob_timeline(
  source: WebComsobKind,
): Promise<FetchComsobResult> {
  return new Promise(async (resolve) => {
    const result = await extract_cells(
      source.top_left_cell,
      source.bottom_right_cell,
      source.sheet_url,
    );
    if (!result.success) {
      resolve({ success: false, error: result.error });
      return;
    }
    try {
      const timeline: Timeline = csv_to_timeline(
        result.data,
        source.split_names_idx,
        source.auto_split_names_idx,
        source.game_times_idx,
      );
      resolve({ success: true, data: timeline });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      resolve({ success: false, error: errorMessage });
    }
  });
}

export type WebComsobKind = {
  name: string;
  top_left_cell: string;
  bottom_right_cell: string;
  sheet_url: string;
  split_names_idx: number;
  auto_split_names_idx: number;
  game_times_idx: number;
};

export const SilksongWebComsob: Record<string, WebComsobKind> =
  silksongComsobData;
export const HKWebComsob: Record<string, WebComsobKind> = hkComsobData;
