// Does this browser's image decoder already apply EXIF orientation?
//
// It is tempting to decode with `createImageBitmap(blob, {imageOrientation:
// 'none'})` and then apply the rotation ourselves. Don't: that option is
// accepted and then ignored for EXIF in Chromium — measured on Chromium 141,
// where a 3000×2000 JPEG tagged orientation=6 decodes to 2000×3000 through
// *every* path ('none', 'from-image', default, and <img>). Applying our own
// transform on top of that rotates the photo twice.
//
// Engines genuinely disagree here and have changed behaviour across versions,
// so rather than hardcode a guess per browser, ask the decoder once with a
// known-tagged image and cache the answer.

// 2×1 red/blue JPEG tagged EXIF orientation=6. If the decoder honours the tag
// it comes back 1×2; if it ignores it, 2×1.
const PROBE_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4QAiRXhpZgAATU0AKgAAAAgAAQES' +
  'AAMAAAABAAYAAAAAAAD/2wBDAFA3PEY8MlBGQUZaVVBfeMiCeG5uePWvuZHI////////////////' +
  '////////////////////////////2wBDAVVaWnhpeOuCguv/////////////////////////////' +
  '////////////////////////////////////wAARCAABAAIDASIAAhEBAxEB/8QAHwAAAQUBAQEB' +
  'AQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1Fh' +
  'ByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZ' +
  'WmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXG' +
  'x8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAEC' +
  'AwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHB' +
  'CSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0' +
  'dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX' +
  '2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCsepooorrWwnuf/9k=';

let cached = null;

export function decoderAppliesExifOrientation(decode) {
  if (cached) return cached;
  cached = (async () => {
    try {
      const blob = await (await fetch(PROBE_JPEG)).blob();
      const image = await decode(blob);
      const width = image.naturalWidth ?? image.width;
      const height = image.naturalHeight ?? image.height;
      if (typeof image.close === 'function') image.close();
      // Tagged orientation=6 swaps a 2×1 into a 1×2 when honoured.
      return height > width;
    } catch {
      // Modern engines overwhelmingly do apply it; assuming they don't would
      // rotate correctly-decoded photos, which is the more visible failure.
      return true;
    }
  })();
  return cached;
}
