// =============================================================================
// ExamVault - File download utility
// Used by bulk-upload dialogs to let admins download a JSON template they can
// fill in and re-upload.
// =============================================================================

/**
 * Trigger a browser download of a JSON file.
 *
 * @param filename  Desired file name (with or without `.json` extension).
 * @param data      Any JSON-serializable value (object, array, string, ...).
 *                  Strings are downloaded as-is; everything else is pretty-
 *                  printed with 2-space indentation.
 */
export function downloadJson(filename: string, data: unknown): void {
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the click has time to register in all browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Triggers a CSV file download in the browser.
 * @param filename  desired filename (with or without .csv extension)
 * @param headers    array of column header strings
 * @param rows       array of rows; each row is an array of cell values
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]): void {
  const escape = (val: string | number | boolean): string => {
    const s = String(val ?? '');
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n');
  // Prepend BOM so Excel reads UTF-8 correctly
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses a CSV string into a 2D array of cells.
 * Handles quoted fields, escaped quotes ("") and CRLF/LF line endings.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;
  // Normalize CRLF to LF
  const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  while (i < t.length) {
    const ch = t[i];
    if (inQuotes) {
      if (ch === '"') {
        if (t[i + 1] === '"') { cell += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cell += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(cell); cell = ''; i++; continue; }
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; continue; }
    cell += ch; i++;
  }
  // last cell
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  // remove trailing empty row if any
  if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
  return rows;
}
