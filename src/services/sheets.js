const API_URL = import.meta.env.VITE_SHEETS_API_URL;
const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const useAppsScript = !!API_URL;

// ---------------------------------------------------------------------------
// Apps Script web app mode (preferred — no API keys needed)
// ---------------------------------------------------------------------------

async function appsScriptGet(params) {
  const url = new URL(API_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Apps Script request failed: ${res.statusText}`);
  return res.json();
}

async function appsScriptWrite(body) {
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  });
  return { status: 'ok' };
}

// ---------------------------------------------------------------------------
// Direct Google Sheets API mode (fallback — requires API key)
// ---------------------------------------------------------------------------

function sheetsApiUrl(range, params = {}) {
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(range)}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? String(row[i]) : '';
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchSheet(sheetName) {
  if (useAppsScript) {
    const res = await appsScriptGet({ action: 'read', sheet: sheetName });
    if (res.status !== 'ok') throw new Error(res.message || 'Failed to read sheet');
    return res.data;
  }

  const url = sheetsApiUrl(`${sheetName}!A:ZZ`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${sheetName}: ${res.statusText}`);
  const data = await res.json();
  return rowsToObjects(data.values || []);
}

export async function fetchAllSheets(sheetNames) {
  if (useAppsScript) {
    const res = await appsScriptGet({ action: 'readAll', sheets: sheetNames.join(',') });
    if (res.status !== 'ok') throw new Error(res.message || 'Failed to read sheets');
    return res.data;
  }

  const results = {};
  await Promise.all(
    sheetNames.map(async (name) => {
      results[name] = await fetchSheet(name);
    })
  );
  return results;
}

export async function updateRow(sheetName, id, rowData) {
  if (useAppsScript) {
    return appsScriptWrite({ action: 'update', sheet: sheetName, id, row: rowData });
  }
  return appendRow(sheetName, rowData);
}

export async function appendRow(sheetName, rowData) {
  if (useAppsScript) {
    return appsScriptWrite({ action: 'append', sheet: sheetName, row: rowData });
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(sheetName)}!A:ZZ:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [rowData] }),
  });
  if (!res.ok) throw new Error(`Failed to append to ${sheetName}: ${res.statusText}`);
  return res.json();
}

export async function getSheetMetadata() {
  if (useAppsScript) {
    const res = await appsScriptGet({ action: 'metadata' });
    if (res.status !== 'ok') throw new Error(res.message || 'Failed to get metadata');
    return res;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}?key=${API_KEY}&fields=sheets.properties`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.statusText}`);
  return res.json();
}
