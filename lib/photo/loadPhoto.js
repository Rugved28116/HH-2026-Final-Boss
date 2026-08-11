// File → render-ready bitmap. Handles HEIC conversion, EXIF orientation, and
// downscaling, and returns a plain <canvas> so the renderers keep taking one
// drawImage-able thing with .width/.height (lib/render/motifs.js).
//
// Every failure path throws a PhotoError with a code the UI maps to a
// message — no silent nulls, no dead ends (app-flow.md §2).

import {
  applyOrientationTransform,
  orientationSwapsAxes,
  readExifOrientation,
} from './exif';
import { decoderAppliesExifOrientation } from './orientationSupport';

export const PHOTO_ERRORS = {
  NO_FILE: 'no_file',
  UNSUPPORTED_TYPE: 'unsupported_type',
  HEIC_FAILED: 'heic_failed',
  DECODE_FAILED: 'decode_failed',
};

export class PhotoError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PhotoError';
    this.code = code;
  }
}

const ERROR_MESSAGES = {
  [PHOTO_ERRORS.NO_FILE]: 'No file received. Try picking it again.',
  [PHOTO_ERRORS.UNSUPPORTED_TYPE]:
    "That's not an image file. Use a JPG, PNG, WEBP, or HEIC photo.",
  [PHOTO_ERRORS.HEIC_FAILED]:
    "Couldn't convert that HEIC photo. Try exporting it as JPG first.",
  [PHOTO_ERRORS.DECODE_FAILED]:
    "Couldn't read that image — the file may be damaged. Try another photo.",
};

export function photoErrorMessage(error) {
  return (
    ERROR_MESSAGES[error?.code] ??
    'Something went wrong reading that photo. Try another one.'
  );
}

/* Size budget ------------------------------------------------------------ */
// Both formats crop the photo into a circle; the largest one drawn is the PFP
// frame's, ~778px across at export size. Anything past ~1300px on the short
// side is invisible detail that still costs us memory and per-frame drawImage
// time on every re-render, which Phase 3 does on each keystroke.

const MAX_SHORT_SIDE = 1400;
const MAX_PIXELS = 5_000_000;
const MAX_ASPECT = 3; // centred crop past this can't affect a circular crop

const HEIC_EXT = /\.(heic|heif)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i;

function isHeic(file) {
  return /^image\/hei[cf]/i.test(file.type) || HEIC_EXT.test(file.name || '');
}

function sourceTypeOf(file) {
  if (isHeic(file)) return 'heic';
  const name = file.name || '';
  if (/^image\/png$/i.test(file.type) || /\.png$/i.test(name)) return 'png';
  if (/^image\/webp$/i.test(file.type) || /\.webp$/i.test(name)) return 'webp';
  return 'jpg';
}

/**
 * @param {File|Blob} file
 * @returns {Promise<{image: HTMLCanvasElement, sourceType: string,
 *                    width: number, height: number}>}
 */
export async function loadPhoto(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new PhotoError(PHOTO_ERRORS.NO_FILE, 'No file provided');
  }

  const sourceType = sourceTypeOf(file);
  const name = file.name || '';
  const looksLikeImage =
    /^image\//i.test(file.type) || IMAGE_EXT.test(name) || !file.type;
  if (!looksLikeImage) {
    throw new PhotoError(PHOTO_ERRORS.UNSUPPORTED_TYPE, `Unsupported: ${file.type}`);
  }

  // HEIC/HEIF: no browser decodes these outside Safari, so convert first.
  // heic2any pulls in a libheif wasm build, so it's imported on demand rather
  // than shipped to everyone who never touches an iPhone photo.
  let blob = file;
  if (isHeic(file)) {
    try {
      const { default: heic2any } = await import('heic2any');
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92,
      });
      // Multi-image HEICs (burst/live photos) convert to an array.
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch (cause) {
      throw new PhotoError(PHOTO_ERRORS.HEIC_FAILED, `HEIC conversion failed: ${cause}`);
    }
  }

  // Most engines rotate during decode, in which case applying the EXIF
  // transform ourselves would be a second rotation. Ask this one what it
  // actually does (cached after the first call), and only parse EXIF when
  // we're the ones responsible — that skips copying the entire file into an
  // ArrayBuffer on every upload in the common case.
  const alreadyOriented = await decoderAppliesExifOrientation(decode);
  let orientation = 1;
  if (!alreadyOriented) {
    try {
      // For converted HEIC this reads the fresh JPEG, which libheif has
      // already rotated upright and which carries no EXIF — correctly 1.
      orientation = readExifOrientation(await blob.arrayBuffer());
    } catch {
      // Unreadable metadata is not a reason to reject the photo.
    }
  }

  const source = await decode(blob);
  try {
    return { image: normalize(source, orientation), sourceType, ...dimensionsOf(source) };
  } finally {
    // ImageBitmaps hold their pixels outside the JS heap until closed.
    if (typeof source.close === 'function') source.close();
  }
}

function dimensionsOf(source) {
  return {
    width: source.naturalWidth ?? source.width,
    height: source.naturalHeight ?? source.height,
  };
}

/* Decode ----------------------------------------------------------------- */

// Whatever this does with EXIF, orientationSupport.js probes the same function,
// so the probe's answer always describes the path actually used here.
async function decode(blob) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob);
    } catch {
      // Some engines reject the blob, some lack full support — the <img> path
      // below distinguishes a real decode failure from a missing API.
    }
  }
  return decodeViaImgElement(blob);
}

function decodeViaImgElement(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PhotoError(PHOTO_ERRORS.DECODE_FAILED, 'Image failed to decode'));
    };
    img.src = url;
  });
}

/* Normalize -------------------------------------------------------------- */

// One off-screen canvas pass that bakes in orientation, the anti-panorama
// crop, and the downscale together — the photo is resampled exactly once.
function normalize(source, effective) {
  const { width: srcW, height: srcH } = dimensionsOf(source);
  if (!srcW || !srcH) {
    throw new PhotoError(PHOTO_ERRORS.DECODE_FAILED, 'Image decoded to zero size');
  }

  // Centred crop down to MAX_ASPECT. A circular cover-fit crop never reaches
  // past this, so it costs no visible pixels — it just stops a 12000×1000
  // panorama from being carried around at full width.
  let sw = srcW;
  let sh = srcH;
  if (srcW / srcH > MAX_ASPECT) sw = Math.round(srcH * MAX_ASPECT);
  else if (srcH / srcW > MAX_ASPECT) sh = Math.round(srcW * MAX_ASPECT);
  const sx = Math.round((srcW - sw) / 2);
  const sy = Math.round((srcH - sh) / 2);

  const scale = Math.min(
    1,
    MAX_SHORT_SIDE / Math.min(sw, sh),
    Math.sqrt(MAX_PIXELS / (sw * sh))
  );
  const drawW = Math.max(1, Math.round(sw * scale));
  const drawH = Math.max(1, Math.round(sh * scale));

  const swap = orientationSwapsAxes(effective);
  const canvas = document.createElement('canvas');
  canvas.width = swap ? drawH : drawW;
  canvas.height = swap ? drawW : drawH;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  applyOrientationTransform(ctx, effective, drawW, drawH);
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, drawW, drawH);

  return canvas;
}
