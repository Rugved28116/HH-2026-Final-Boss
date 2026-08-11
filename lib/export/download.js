// Canvas → PNG file on disk. Entirely local: toBlob + an object URL + a
// synthetic anchor click. No upload, no fetch, nothing that can fail offline
// (app-flow.md §6 — Download must never depend on the network).

export const FILENAMES = {
  pfp: 'hhgoa-2026-pfp.png',
  card: 'hhgoa-2026-card.png',
};

export function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      // toBlob yields null rather than throwing when encoding fails.
      if (blob) resolve(blob);
      else reject(new Error('Canvas could not be encoded to PNG'));
    }, 'image/png');
  });
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 * @returns {Promise<number>} byte size of the written file
 */
export async function downloadCanvas(canvas, filename) {
  const blob = await canvasToPngBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  // Must be in the document for the click to count as user-initiated in
  // Firefox; harmless everywhere else.
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can cancel the download mid-write in Safari, so let
  // the browser finish reading the blob first.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return blob.size;
}
