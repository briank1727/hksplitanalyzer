export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topLeftCell, bottomRightCell, sheetUrl } = body;

    if (!topLeftCell || !bottomRightCell || !sheetUrl) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Extract sheet ID from the URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return Response.json(
        { error: "Invalid Google Sheet URL" },
        { status: 400 },
      );
    }
    const sheetId = sheetIdMatch[1];

    // Extract sheet gid if it exists (e.g., #gid=123 or &gid=123)
    const gidMatch = sheetUrl.match(/[#&]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : null;

    // Construct the range (e.g., "A1:D27")
    const range = `${topLeftCell}:${bottomRightCell}`;

    // Construct the CSV export URL
    let exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&range=${encodeURIComponent(range)}`;
    if (gid) {
      exportUrl += `&gid=${gid}`;
    }

    // Fetch the CSV data from server side
    const response = await fetch(exportUrl);
    if (!response.ok) {
      const responseText = await response.text();
      return Response.json(
        {
          error: `Failed to fetch sheet: ${response.status} ${response.statusText}`,
          details: responseText.substring(0, 500), // First 500 chars for debugging
        },
        { status: response.status },
      );
    }

    const csvText = await response.text();

    // Parse CSV into a 2D array
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        // End of cell
        currentRow.push(currentCell);
        currentCell = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        // End of row
        if (currentCell || currentRow.length > 0) {
          currentRow.push(currentCell);
          rows.push(currentRow);
          currentRow = [];
          currentCell = "";
        }
        // Skip \r\n
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
      } else {
        currentCell += char;
      }
    }

    // Add last cell and row if exists
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }

    if (rows.length === 0) {
      return Response.json(
        { error: "No data found in the specified range" },
        { status: 400 },
      );
    }

    return Response.json({ success: true, data: rows });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
