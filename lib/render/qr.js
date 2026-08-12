// QR code for the Format B card (D3 / schema.md §6). One fixed URL, no
// per-card uniqueness, no server round trip — the whole feature is a static
// bitmap generated once in the browser and composited by the card renderer.

import QRCode from 'qrcode';
import { PALETTE } from './palette';

// Set NEXT_PUBLIC_SITE_URL at deploy time; the fallback keeps the QR scannable
// (and pointing somewhere plausible) in dev.
//
// KEEP THIS URL AT OR UNDER 32 CHARACTERS. At error-correction level L, 32
// bytes is the capacity of a version-2 symbol (25×25 modules). One character
// more silently promotes it to version 3 (29×29), shrinking every module by
// 14% in the same physical space — which is the difference between scanning
// and not at phone-screen sizes. See QR_MODULES below.
export const QR_TARGET_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hhgoa.com/';

// Version 2 (25×25) plus the 4-module quiet zone on each side. Used to reason
// about module size: drawnSize / QR_MODULES px per module, and roughly 3px per
// module is the floor for a reliable scan.
export const QR_MODULES = 25 + 8;

let cache = null;

/**
 * Renders the QR once into an offscreen canvas and caches it, so the card's
 * draw pass stays synchronous — the caller awaits this during setup (alongside
 * fonts) and then just hands the bitmap to drawCardFrame.
 *
 * @param {number} size pixel width of the symbol *including* its quiet zone
 * @returns {Promise<HTMLCanvasElement|null>} null if generation fails; the card
 *   falls back to its placeholder rather than breaking the whole render.
 */
export function getQrCanvas(size) {
  if (cache) return cache;
  cache = QRCode.toCanvas(document.createElement('canvas'), QR_TARGET_URL, {
    width: size,
    // 4 modules is the spec-mandated quiet zone. Baking it into the bitmap in
    // the light colour means the card doesn't need a separate backing plate to
    // get the margin right.
    margin: 4,
    // 'L' rather than 'M' deliberately. At this physical size the failure mode
    // is resolution, not damage: dropping to L keeps the 29-character URL in a
    // version-2 symbol, and the resulting bigger modules buy far more
    // real-world scannability than the extra error correction would.
    errorCorrectionLevel: 'L',
    color: {
      dark: PALETTE.ink,
      light: PALETTE.cream,
    },
  })
    .then((canvas) => canvas)
    .catch(() => null);
  return cache;
}
