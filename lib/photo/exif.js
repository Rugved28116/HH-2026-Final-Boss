// Minimal EXIF orientation reader. We only ever need tag 0x0112 out of IFD0,
// so this walks the JPEG segment list to the APP1/Exif block and reads that
// one value rather than pulling in a full EXIF parser dependency.
//
// Returns 1–8 (the EXIF orientation values); 1 for anything it can't read,
// which is the "no transform needed" case and the right thing to assume.

export function readExifOrientation(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4) return 1;
  if (view.getUint16(0, false) !== 0xffd8) return 1; // not a JPEG (SOI)

  let offset = 2;
  while (offset + 3 < view.byteLength) {
    // Segments start with 0xFF; fill bytes are legal, so resync rather than bail.
    if (view.getUint8(offset) !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = view.getUint8(offset + 1);
    offset += 2;

    // Standalone markers carry no payload.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    // Start of scan / end of image — past any metadata, stop.
    if (marker === 0xda || marker === 0xd9) break;

    if (offset + 2 > view.byteLength) break;
    const size = view.getUint16(offset, false);
    if (size < 2) break;

    if (marker === 0xe1) {
      // APP1: payload is "Exif\0\0" then a TIFF header.
      if (
        offset + 8 <= view.byteLength &&
        view.getUint32(offset + 2, false) === 0x45786966 // "Exif"
      ) {
        return readTiffOrientation(view, offset + 8);
      }
    }
    offset += size;
  }
  return 1;
}

function readTiffOrientation(view, tiffStart) {
  if (tiffStart + 8 > view.byteLength) return 1;

  const endian = view.getUint16(tiffStart, false);
  let little;
  if (endian === 0x4949) little = true; // "II"
  else if (endian === 0x4d4d) little = false; // "MM"
  else return 1;

  if (view.getUint16(tiffStart + 2, little) !== 42) return 1; // TIFF magic

  const dirStart = tiffStart + view.getUint32(tiffStart + 4, little);
  if (dirStart + 2 > view.byteLength) return 1;

  const entries = view.getUint16(dirStart, little);
  for (let i = 0; i < entries; i++) {
    const entry = dirStart + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    if (view.getUint16(entry, little) === 0x0112) {
      const value = view.getUint16(entry + 8, little);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

// Orientations 5–8 are the 90° rotations, which swap width and height.
export function orientationSwapsAxes(orientation) {
  return orientation >= 5 && orientation <= 8;
}

// Applies the EXIF orientation as a canvas transform. (w, h) are the drawn
// image's dimensions *before* rotation; the canvas itself must already be
// sized with the axes swapped when orientationSwapsAxes() is true.
export function applyOrientationTransform(ctx, orientation, w, h) {
  switch (orientation) {
    case 2: // flip horizontal
      ctx.transform(-1, 0, 0, 1, w, 0);
      break;
    case 3: // rotate 180°
      ctx.transform(-1, 0, 0, -1, w, h);
      break;
    case 4: // flip vertical
      ctx.transform(1, 0, 0, -1, 0, h);
      break;
    case 5: // transpose
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6: // rotate 90° clockwise
      ctx.transform(0, 1, -1, 0, h, 0);
      break;
    case 7: // transverse
      ctx.transform(0, -1, -1, 0, h, w);
      break;
    case 8: // rotate 90° counter-clockwise
      ctx.transform(0, -1, 1, 0, 0, w);
      break;
    default: // 1, or anything unrecognized — no transform
      break;
  }
}
