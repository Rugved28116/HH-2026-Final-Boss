// Shared drawing primitives for both formats (design.md §4). Anything drawn
// by more than one renderer lives here so the two formats can't drift apart
// visually — the framed-photo treatment especially is meant to be identical.

import { PALETTE, withAlpha } from './palette';

const INK_INNER = withAlpha(PALETTE.ink, 0.16);
const INK_INNER_BLEED = withAlpha(PALETTE.ink, 0.45);

// Diagonal green gradient, deep upper-left → light lower-right.
export function paintGradient(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, PALETTE.greenDeep);
  g.addColorStop(0.52, PALETTE.greenMid);
  g.addColorStop(1, PALETTE.greenLight);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Rounded-rect path built from arcs (no ctx.roundRect dependency).
// r may be up to h/2, which produces a full pill.
export function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2);
  ctx.closePath();
}

/**
 * Deterministic 0–1 noise for scuffed sticker edges.
 *
 * Must never be Math.random: the card repaints on every keystroke, and edges
 * that re-roll each frame would shimmer. Same index always yields the same
 * offset, so the scuff is a fixed property of the shape.
 */
export function stickerNoise(index) {
  const v = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** Signed jitter in ±amount, stable per index. */
export function stickerJitter(index, amount) {
  return (stickerNoise(index) - 0.5) * 2 * amount;
}

// Wear marks: hairline nicks along a sticker's edge, as if it has been picked
// at. Cream rather than white or grey so they read as the sticker's own
// backing showing through. Positions come from stickerNoise, so they are fixed
// per shape and never crawl between repaints.
const SCUFF_CREAM = withAlpha(PALETTE.cream, 0.5);

function scuffStroke(ctx) {
  ctx.strokeStyle = SCUFF_CREAM;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
}

/** Nicks scattered around a circular edge. */
export function scuffCircle(ctx, cx, cy, r, count, seed = 0) {
  ctx.save();
  scuffStroke(ctx);
  for (let i = 0; i < count; i++) {
    const a = stickerNoise(seed + i * 7.3) * Math.PI * 2;
    const rr = r + stickerJitter(seed + i * 3.1, 2);
    const len = 3 + stickerNoise(seed + i * 5.9) * 5;
    const spread = len / r;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, a, a + spread);
    ctx.stroke();
  }
  ctx.restore();
}

/** Nicks scattered along a rectangular edge, walked as a perimeter. */
export function scuffRect(ctx, x, y, w, h, count, seed = 0) {
  ctx.save();
  scuffStroke(ctx);
  const perimeter = 2 * (w + h);
  for (let i = 0; i < count; i++) {
    const d = stickerNoise(seed + i * 11.7) * perimeter;
    const len = 3 + stickerNoise(seed + i * 4.3) * 5;
    let px;
    let py;
    let dx;
    let dy;
    if (d < w) {
      px = x + d; py = y; dx = 1; dy = 0;
    } else if (d < w + h) {
      px = x + w; py = y + (d - w); dx = 0; dy = 1;
    } else if (d < 2 * w + h) {
      px = x + w - (d - w - h); py = y + h; dx = -1; dy = 0;
    } else {
      px = x; py = y + h - (d - 2 * w - h); dx = 0; dy = -1;
    }
    const off = stickerJitter(seed + i * 2.7, 1.5);
    ctx.beginPath();
    ctx.moveTo(px - dy * off, py - dx * off);
    ctx.lineTo(px + dx * len - dy * off, py + dy * len - dx * off);
    ctx.stroke();
  }
  ctx.restore();
}

export function starPath(ctx, cx, cy, rOuter, rInner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Alternating pink/white dashed stroke along the current styling: two dashed
// passes sharing one period, the white pass offset into the pink pass's gaps.
// The slack between segments is deliberate — bunting flags, not a striped line.
function strokeBunting(ctx, pathFn) {
  ctx.save();
  ctx.lineWidth = 6;

  ctx.strokeStyle = PALETTE.pink;
  ctx.setLineDash([16, 24]);
  ctx.lineDashOffset = 0;
  pathFn();
  ctx.stroke();

  ctx.strokeStyle = PALETTE.white;
  ctx.lineDashOffset = -20;
  pathFn();
  ctx.stroke();

  ctx.restore();
}

export function strokeBuntingCircle(ctx, cx, cy, r) {
  strokeBunting(ctx, () => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  });
}

export function strokeBuntingPill(ctx, x, y, w, h) {
  strokeBunting(ctx, () => roundRectPath(ctx, x, y, w, h, h / 2));
}

// The signature photo treatment (design.md §5/§6): cover-cropped circular
// photo, solid yellow ring, pink/white bunting ring just outside. Identical
// construction in both formats, only the scale differs.
export function drawFramedCirclePhoto(
  ctx,
  { cx, cy, photoR, ringW, buntingGap = 22, photoTransform = null },
  photo
) {
  // Photo (or stand-in), clipped to the circle.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    // Cover-fit with optional user pan/zoom transform
    const d = photoR * 2;
    const baseScale = Math.max(d / photo.width, d / photo.height);
    const zoomMultiplier = photoTransform?.zoom ?? 1;
    const scale = baseScale * zoomMultiplier;
    const w = photo.width * scale;
    const h = photo.height * scale;
    const panX = photoTransform?.panX ?? 0;
    const panY = photoTransform?.panY ?? 0;
    ctx.drawImage(photo, cx - w / 2 + panX, cy - h / 2 + panY, w, h);
  } else {
    ctx.fillStyle = PALETTE.greenLight;
    ctx.fillRect(cx - photoR, cy - photoR, photoR * 2, photoR * 2);
  }
  ctx.restore();

  // Yellow ring.
  ctx.save();
  ctx.strokeStyle = PALETTE.yellow;
  ctx.lineWidth = ringW;
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + ringW / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Aged inner edge: a soft dark bleed where the ring meets the photo, clipped
  // to the ring itself so nothing spills onto the picture. Canvas has no inner
  // shadow, so this is a blurred stroke masked by the annulus.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + ringW, 0, Math.PI * 2);
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.clip('evenodd');
  ctx.strokeStyle = INK_INNER;
  ctx.lineWidth = 2;
  ctx.shadowColor = INK_INNER_BLEED;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + 1, 0, Math.PI * 2);
  ctx.stroke();
  // Matching bleed at the ring's outer edge, still inside the same mask.
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + ringW - 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Die-cut edge: the cream outline that reads as a sticker's cut line against
  // the green, sitting just outside the yellow and inside the bunting.
  ctx.save();
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + ringW + 1.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // A few picked-at nicks on the ring's cut edge.
  scuffCircle(ctx, cx, cy, photoR + ringW + 1.25, 5, 1);

  // Bunting ring just outside the yellow.
  strokeBuntingCircle(ctx, cx, cy, photoR + ringW + buntingGap);
}
