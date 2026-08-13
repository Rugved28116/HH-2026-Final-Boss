// Keystroke-rate painter for Format B.
// Restores static layer from cache and repaints dynamic fields.

import {
  CARD_DYNAMIC_BAND,
  CARD_H,
  CARD_W,
  drawCardDynamic,
  drawCardStatic,
} from './card';

export function createCardPainter() {
  let cache = null;
  let cachedPhoto;
  let cachedQr;
  let cachedFonts;
  let cachedTransformKey = '';
  let cachedStickersKey = '';
  let cacheValid = false;
  // Which context the static layer was last blitted into. The band-only fast
  // path below assumes the target already holds the static layer; that stops
  // being true the moment the caller hands over a different canvas.
  let paintedCtx = null;

  return function paintCard(
    ctx,
    {
      fonts,
      photo = null,
      qr = null,
      fields,
      sheen = null,
      photoTransform = null,
      selectedStickers = null,
    }
  ) {
    if (!cache) {
      cache = document.createElement('canvas');
      cache.width = CARD_W;
      cache.height = CARD_H;
    }

    const transformKey = JSON.stringify(photoTransform || {});
    const stickersKey = JSON.stringify(selectedStickers || []);

    const cacheStale =
      !cacheValid ||
      photo !== cachedPhoto ||
      qr !== cachedQr ||
      fonts !== cachedFonts ||
      transformKey !== cachedTransformKey ||
      stickersKey !== cachedStickersKey;

    if (cacheStale) {
      drawCardStatic(cache.getContext('2d'), {
        fonts,
        photo,
        qr,
        photoTransform,
        selectedStickers,
      });
      cachedPhoto = photo;
      cachedQr = qr;
      cachedFonts = fonts;
      cachedTransformKey = transformKey;
      cachedStickersKey = stickersKey;
      cacheValid = true;
    }

    // A canvas the painter hasn't drawn into yet is blank, so it needs the
    // whole static layer — not just the band. This happens on every remount:
    // switching to the Team format unmounts the badge holding this canvas, and
    // switching back mounts a fresh, empty one. Blitting only the band there
    // left the card empty above and below the name/role strip.
    //
    // Note this is a re-blit, not a re-render: an unchanged cache is reused as
    // is, so returning to the card costs one drawImage, not a full static pass.
    if (cacheStale || ctx !== paintedCtx) {
      ctx.drawImage(cache, 0, 0);
    } else {
      const { y, h } = CARD_DYNAMIC_BAND;
      ctx.drawImage(cache, 0, y, CARD_W, h, 0, y, CARD_W, h);
    }
    paintedCtx = ctx;

    drawCardDynamic(ctx, { fonts, fields, sheen });
  };
}
