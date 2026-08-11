// Format A — PFP Frame, 1080×1080. Layout spec: design.md §5.
// Pure draw module: given a 2d context and resolved font families, paints the
// whole frame in one pass. No DOM, no state — the preview page (and later the
// real app + export path) all call the same function.

import { PALETTE, withAlpha } from './palette';
import {
  drawFramedCirclePhoto,
  paintGradient,
  roundRectPath,
  scuffCircle,
  scuffRect,
  starPath,
} from './motifs';

const INK_SHADOW = withAlpha(PALETTE.ink, 0.35);
const INK_SHADOW_HEAVY = withAlpha(PALETTE.ink, 0.45);
const INK_INNER = withAlpha(PALETTE.ink, 0.2);

export const PFP_SIZE = 1080;

const CX = PFP_SIZE / 2;
const CY = PFP_SIZE / 2;
const PHOTO_R = (PFP_SIZE * 0.72) / 2; // photo circle ≈72% of canvas width (§5)
const RING_W = PFP_SIZE * 0.03; // yellow ring ≈3% of canvas width (§5)

export function drawPfpFrame(ctx, { fonts, photo = null, photoTransform = null }) {
  ctx.save();
  ctx.clearRect(0, 0, PFP_SIZE, PFP_SIZE);

  paintGradient(ctx, PFP_SIZE, PFP_SIZE);
  drawDoodles(ctx);
  drawFramedCirclePhoto(ctx, { cx: CX, cy: CY, photoR: PHOTO_R, ringW: RING_W, photoTransform }, photo);
  drawStampSeal(ctx, fonts);
  drawTickerBar(ctx, fonts);

  ctx.restore();
}

/* Doodles ---------------------------------------------------------------- */
// Thin single-weight white line art, no fill, low opacity, kept in the
// corners the ring doesn't reach (design.md §4: 2–4 per composition).

function drawDoodles(ctx) {
  ctx.save();
  ctx.strokeStyle = PALETTE.white;
  ctx.globalAlpha = 0.38;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawPalmFrond(ctx, 78, 64);
  drawSunDoodle(ctx, 972, 108);
  drawWave(ctx, 52, 846);

  ctx.restore();
}

// Quadratic-bezier point + tangent, used to hang leaflets off the frond rib.
function qPoint(t, p0, p1, p2) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function qTangent(t, p0, p1, p2) {
  const x = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const y = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function drawPalmFrond(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  // Curved central rib.
  const p0 = { x: 0, y: 150 };
  const p1 = { x: 26, y: 36 };
  const p2 = { x: 168, y: 6 };
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
  ctx.stroke();

  // Leaflets off both sides, shrinking toward the tip. Each one bows out
  // from the rib and drops back toward the base — straight perpendicular
  // ticks read as barbed wire, not palm.
  for (let i = 0; i < 6; i++) {
    const t = 0.14 + i * 0.15;
    const p = qPoint(t, p0, p1, p2);
    const d = qTangent(t, p0, p1, p2);
    const len = 52 - i * 6;
    for (const s of [-1, 1]) {
      const px = -d.y * s;
      const py = d.x * s;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(
        p.x + px * len * 0.78 + d.x * len * 0.2,
        p.y + py * len * 0.78 + d.y * len * 0.2,
        p.x + px * len * 0.9 - d.x * len * 0.42,
        p.y + py * len * 0.9 - d.y * len * 0.42
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSunDoodle(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.stroke();

  // Straight rays, evenly spaced (design.md §4: flat sun + rays).
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 42, Math.sin(a) * 42);
    ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWave(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  // Two rows of scallops, the lower one offset — reads as overlapping surf.
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(24 + i * 48, 0, 24, Math.PI, 0, false);
    ctx.stroke();
  }
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(48 + i * 48, 30, 24, Math.PI, 0, false);
    ctx.stroke();
  }
  ctx.restore();
}

/* Stamp seal ------------------------------------------------------------- */

function drawStampSeal(ctx, fonts) {
  // Overlaps the ring at ~2 o'clock (§5) — sits on the yellow ring's outer
  // edge so it reads as stamped over the frame, not floating next to it.
  const angle = -Math.PI / 6; // 2 o'clock
  const dist = PHOTO_R + RING_W;
  const sx = CX + Math.cos(angle) * dist;
  const sy = CY + Math.sin(angle) * dist;
  const R = 84;

  ctx.save();
  ctx.translate(sx, sy);
  // Tilt kept inside ±7°: enough to read as hand-applied, not so much that
  // it looks like a rendering error at the 2 o'clock position.
  ctx.rotate((-6 * Math.PI) / 180);

  // Flat offset shadow (the site's shadow treatment is hard-edged, not blurred).
  ctx.fillStyle = INK_SHADOW;
  ctx.beginPath();
  ctx.arc(6, 8, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();

  // Thin dark cut line around the seal — without it the cream disc dissolves
  // into the yellow ring it overlaps.
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, R - 1.25, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.pink;
  ctx.lineWidth = 3.5;
  ctx.setLineDash([9, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, R - 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Star, outlined so it stays a distinct shape against the pink dashes rather
  // than reading as another blob of the same colour.
  starPath(ctx, 0, -26, 19, 8);
  ctx.fillStyle = PALETTE.pink;
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.75;
  ctx.lineJoin = 'round';
  ctx.stroke();

  scuffCircle(ctx, 0, 0, R - 1.5, 4, 53);

  ctx.fillStyle = PALETTE.ink;
  ctx.font = `700 30px ${fonts.mono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '5px';
  ctx.fillText('GOA', 2, 28); // +2 optically re-centers the letterspaced run
  ctx.letterSpacing = '0px';

  ctx.restore();
}

/* Ticker bar ------------------------------------------------------------- */

function drawTickerBar(ctx, fonts) {
  const segments = [
    { text: 'HACKER HOUSE GOA', color: PALETTE.yellow },
    { text: ' · ', color: PALETTE.pink },
    { text: '2026', color: PALETTE.yellow },
  ];

  // Auto-fit the wordmark so the pill stays narrower than the photo circle.
  const maxTextW = 620;
  let fontSize = 58;
  let widths;
  let totalW;
  do {
    ctx.font = `900 ${fontSize}px ${fonts.display}`;
    widths = segments.map((s) => ctx.measureText(s.text).width);
    totalW = widths.reduce((a, b) => a + b, 0);
    if (totalW <= maxTextW) break;
    fontSize -= 2;
  } while (fontSize > 30);

  const padX = 56;
  const pillW = totalW + padX * 2;
  const pillH = 104;
  const pillCy = CY + PHOTO_R; // overlaps the bottom of the ring (§5)

  ctx.save();

  const px = CX - pillW / 2;
  const py = pillCy - pillH / 2;
  roundRectPath(ctx, px, py, pillW, pillH, pillH / 2);
  ctx.fillStyle = PALETTE.ink;
  ctx.fill();

  // Same wear treatment as the card's footer bar, so the two formats read as
  // the same set of stickers.
  ctx.save();
  roundRectPath(ctx, px, py, pillW, pillH, pillH / 2);
  ctx.clip();
  ctx.strokeStyle = INK_INNER;
  ctx.lineWidth = 3;
  ctx.shadowColor = INK_SHADOW_HEAVY;
  ctx.shadowBlur = 5;
  roundRectPath(ctx, px, py, pillW, pillH, pillH / 2);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 2;
  roundRectPath(ctx, px + 1, py + 1, pillW - 2, pillH - 2, pillH / 2 - 1);
  ctx.stroke();
  scuffRect(ctx, px, py, pillW, pillH, 5, 67);

  ctx.font = `900 ${fontSize}px ${fonts.display}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  let tx = CX - totalW / 2;
  const ty = pillCy + fontSize * 0.34; // optical vertical center for the serif
  segments.forEach((s, i) => {
    ctx.fillStyle = s.color;
    ctx.fillText(s.text, tx, ty);
    tx += widths[i];
  });

  ctx.restore();
}
