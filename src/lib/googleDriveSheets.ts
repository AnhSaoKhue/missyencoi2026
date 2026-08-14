export interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetRangeData {
  range: string;
  majorDimension: string;
  values: string[][];
}

/**
 * List files from user's Google Drive.
 * Can filter by mimeType (e.g. 'application/vnd.google-apps.spreadsheet')
 */
export async function listDriveFiles(
  accessToken: string,
  filterSpreadsheetsOnly = false,
  searchQuery = ''
): Promise<GoogleFile[]> {
  try {
    let q = 'trashed = false';
    if (filterSpreadsheetsOnly) {
      q += " and mimeType = 'application/vnd.google-apps.spreadsheet'";
    }
    if (searchQuery.trim()) {
      q += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
    }

    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set('q', q);
    url.searchParams.set('fields', 'files(id, name, mimeType, modifiedTime, webViewLink)');
    url.searchParams.set('pageSize', '30');
    url.searchParams.set('orderBy', 'modifiedTime desc');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể tải danh sách tệp Google Drive');
    }

    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Error listing Google Drive files:', error);
    throw error;
  }
}

/**
 * Read contents/values from a Google Sheet
 */
export async function readSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range = 'A1:Z100'
): Promise<SheetRangeData> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể đọc dữ liệu Google Sheets');
    }

    return await res.json();
  } catch (error: any) {
    console.error('Error reading Google Sheets values:', error);
    throw error;
  }
}

/**
 * Get Spreadsheet info including sheet names
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheetNames: string[] }> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể lấy thông tin Google Sheets');
    }

    const data = await res.json();
    const title = data.properties?.title || 'Google Sheet';
    const sheetNames = (data.sheets || []).map((s: any) => s.properties?.title || 'Sheet1');

    return { title, sheetNames };
  } catch (error: any) {
    console.error('Error getting Google Sheet details:', error);
    throw error;
  }
}

/**
 * Create a new Google Sheet on user's Google Drive
 */
export async function createGoogleSheet(
  accessToken: string,
  title: string,
  initialHeaders: string[],
  rowsData: string[][] = []
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  try {
    // 1. Create Spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Không thể tạo tệp Google Sheets mới');
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // 2. Populate Headers & Rows
    if (initialHeaders.length > 0 || rowsData.length > 0) {
      const values = [initialHeaders, ...rowsData];
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`;
      await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      });
    }

    return { spreadsheetId, spreadsheetUrl };
  } catch (error: any) {
    console.error('Error creating Google Sheet:', error);
    throw error;
  }
}

/**
 * Append rows to an existing Google Sheet
 */
export async function appendToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  rowsData: string[][],
  range = 'A1'
): Promise<void> {
  try {
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rowsData,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể thêm dòng dữ liệu vào Google Sheets');
    }
  } catch (error: any) {
    console.error('Error appending to Google Sheet:', error);
    throw error;
  }
}
