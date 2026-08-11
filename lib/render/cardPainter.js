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

    if (
      !cacheValid ||
      photo !== cachedPhoto ||
      qr !== cachedQr ||
      fonts !== cachedFonts ||
      transformKey !== cachedTransformKey ||
      stickersKey !== cachedStickersKey
    ) {
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
      ctx.drawImage(cache, 0, 0);
    } else {
      const { y, h } = CARD_DYNAMIC_BAND;
      ctx.drawImage(cache, 0, y, CARD_W, h, 0, y, CARD_W, h);
    }

    drawCardDynamic(ctx, { fonts, fields, sheen });
  };
}
