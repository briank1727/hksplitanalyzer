import { formatTimespan } from "@/lib/timespan";
import { Timeline, TimelineSegment } from "./timeline";

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

export const WebComsob = {
  AnyKeyRoute: {
    name: "Any% Key Route (RP)",
    top_left_cell: "B4",
    bottom_right_cell: "D25",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=2094941807#gid=2094941807",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  AnyBellsRoute: {
    name: "Any% Bells Route",
    top_left_cell: "B4",
    bottom_right_cell: "D26",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=7316953#gid=7316953",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  TrueEnding891: {
    name: "True Ending (891)",
    top_left_cell: "B5",
    bottom_right_cell: "D68",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1xZk3XRwhGBW64vsMfUhLkfUdud0V1iuWYxjg8v9ssGs/edit?gid=463520651#gid=463520651",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  OneHundredPercentMonstahlerV6: {
    name: "100% Monstahler V6 (891)",
    top_left_cell: "B4",
    bottom_right_cell: "D102",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1pam4Xeu3fC4VrDLcHGtacHD2oEbwDo_RX2rctOLvyX0/edit?gid=1808861139#gid=1808861139",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  LowPercent: {
    name: "Low%",
    top_left_cell: "B4",
    bottom_right_cell: "D29",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1VOfmmYpoLeAgdwi3k9CmCxJAPYk3-bvNQb1vHiAwELw/edit?gid=7752011#gid=7752011",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  AllBosses: {
    name: "All Bosses (Act 3)",
    top_left_cell: "B4",
    bottom_right_cell: "D95",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1juPDWzwMMg-BNKS2JvqqgQ-oRl76neLitUfoYfzl_2Q/edit?gid=1151571350#gid=1151571350",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  AllBossesAct2: {
    name: "All Bosses (Act 2)",
    top_left_cell: "B4",
    bottom_right_cell: "D58",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/125RGkNo8FLEpzCnv_tYpoZzbRWKyWPuBmIk3e0XyG3o/edit?gid=0#gid=0",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  AllBossesAct1: {
    name: "All Bosses (Act 1)",
    top_left_cell: "B4",
    bottom_right_cell: "D26",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/19tDgaU2f2DsYmtWl6E951yx6JqIwODv_Lx8scUZjr1w/edit?gid=617578394#gid=617578394",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  AnyKeyRouteOldComsobPoints: {
    name: "Any% Key Route (Old ComSOB Points)",
    top_left_cell: "B4",
    bottom_right_cell: "D23",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=443305765#gid=443305765",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  AnyBellsRouteOldComsobPoints: {
    name: "Any% Bells Route (Old ComSOB Points)",
    top_left_cell: "B4",
    bottom_right_cell: "D25",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=43527522#gid=43527522",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  TrueEnding891Old: {
    name: "True Ending (891) (Old)",
    top_left_cell: "B3",
    bottom_right_cell: "D61",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1xZk3XRwhGBW64vsMfUhLkfUdud0V1iuWYxjg8v9ssGs/edit?gid=1416049146#gid=1416049146",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  OneHundredPercentMathuluV2_1: {
    name: "100% Mathulu V2.1 (LP)",
    top_left_cell: "B4",
    bottom_right_cell: "D103",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1pam4Xeu3fC4VrDLcHGtacHD2oEbwDo_RX2rctOLvyX0/edit?gid=1396866315#gid=1396866315",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
  OneHundredPercentMonstahlerV6BB: {
    name: "100% Monstahler V6 (891) Old Bilewater Backup",
    top_left_cell: "B4",
    bottom_right_cell: "D102",
    sheet_url:
      "https://docs.google.com/spreadsheets/d/1pam4Xeu3fC4VrDLcHGtacHD2oEbwDo_RX2rctOLvyX0/edit?gid=1151571350#gid=1151571350",
    split_names_idx: 0,
    auto_split_names_idx: 1,
    game_times_idx: 2,
  },
} as const satisfies Record<string, WebComsobKind>;
