import type { LiveSplit, Segment, SplitTime } from "@/lib/lss_logic";
import { parse_lss } from "@/lib/lss_logic";
import { TS_ZERO, formatTimespan } from "@/lib/timespan";

export function import_lss(): Promise<{
  content: string;
  fileName: string;
} | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".lss";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ content: reader.result as string, fileName: file.name });
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}

export type ExtractCellsResult =
  | { success: true; data: string[][] }
  | { success: false; error: string };

export type FetchLSSResult =
  | { success: true; data: LiveSplit }
  | { success: false; error: string };

export async function extract_cells(
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

export function csv_to_lss(
  data: string[][],
  splitNamesIdx: number,
  autoSplitNamesIdx: number,
  realTimesIdx: number,
  gameTimesIdx: number,
): LiveSplit {
  if (data.length === 0) {
    throw new Error("CSV data must contain at least one segment");
  }

  // Process all rows (no header row)
  const segments: Segment[] = data.map((row) => ({
    name: row[splitNamesIdx] || "Unknown",
    auto_split_name: row[autoSplitNamesIdx] || "",
    split_times: [
      {
        id: 0,
        real_time: formatTimespan(row[realTimesIdx] || ""),
        game_time: formatTimespan(row[gameTimesIdx] || ""),
      },
    ],
  }));

  return { segments };
}

export function fetch_and_parse_lss(
  topLeftCell: string,
  bottomRightCell: string,
  sheetUrl: string,
  splitNamesIdx: number,
  autoSplitNamesIdx: number,
  realTimesIdx: number,
  gameTimesIdx: number,
): Promise<FetchLSSResult> {
  return new Promise(async (resolve) => {
    const result = await extract_cells(topLeftCell, bottomRightCell, sheetUrl);
    if (!result.success) {
      resolve({ success: false, error: result.error });
      return;
    }
    try {
      const liveSplit: LiveSplit = csv_to_lss(
        result.data,
        splitNamesIdx,
        autoSplitNamesIdx,
        realTimesIdx,
        gameTimesIdx,
      );
      resolve({ success: true, data: liveSplit });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      resolve({ success: false, error: errorMessage });
    }
  });
}

type WebLSSKind = {
  name: string;
  fetch_lss: () => Promise<FetchLSSResult>;
};

export const WebLSS = {
  TrueEnding891New: {
    name: "True Ending 891 (New)",
    fetch_lss: async () => {
      return await fetch_and_parse_lss(
        "B5",
        "D68",
        "https://docs.google.com/spreadsheets/d/1xZk3XRwhGBW64vsMfUhLkfUdud0V1iuWYxjg8v9ssGs/edit?gid=463520651#gid=463520651",
        0,
        1,
        2,
        2,
      );
    },
  },
  TrueEnding891Old: {
    name: "True Ending 891 (Old)",
    fetch_lss: async () => {
      return await fetch_and_parse_lss(
        "B3",
        "D61",
        "https://docs.google.com/spreadsheets/d/1xZk3XRwhGBW64vsMfUhLkfUdud0V1iuWYxjg8v9ssGs/edit?gid=1416049146#gid=1416049146",
        0,
        1,
        2,
        2,
      );
    },
  },
  AnyKeyRoute: {
    name: "Any% Key Route",
    fetch_lss: async () => {
      return await fetch_and_parse_lss(
        "B4",
        "D25",
        "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=2094941807#gid=2094941807",
        0,
        1,
        2,
        2,
      );
    },
  },
  AnyKeyRouteOldComsobPoints: {
    name: "Any% Key Route (Old ComSOB Points)",
    fetch_lss: async () => {
      return await fetch_and_parse_lss(
        "B4",
        "D23",
        "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=443305765#gid=443305765",
        0,
        1,
        2,
        2,
      );
    },
  },
  AnyBellsRoute: {
    name: "Any% Bells Route",
    fetch_lss: async () => {
      return await fetch_and_parse_lss(
        "B4",
        "D26",
        "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=7316953#gid=7316953",
        0,
        1,
        2,
        2,
      );
    },
  },
  AnyBellsRouteOldComsobPoints: {
    name: "Any% Bells Route (Old ComSOB Points)",
    fetch_lss: async () => {
      return await fetch_and_parse_lss(
        "B4",
        "D25",
        "https://docs.google.com/spreadsheets/d/1-Hy5k_h9dBUUPlwh_I14K-DEwGcNdVQ0utI-KX56d8c/edit?gid=43527522#gid=43527522",
        0,
        1,
        2,
        2,
      );
    },
  },
} as const satisfies Record<string, WebLSSKind>;
