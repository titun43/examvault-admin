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
