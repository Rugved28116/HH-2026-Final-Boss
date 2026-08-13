// Format B — Builder ID Card, 1080×1512 (5:7 portrait). Layout spec:
// design.md §6. Same contract as the PFP renderer: pure draw module, one
// pass, no DOM or state.

import { PALETTE, withAlpha } from './palette';
import {
  drawFramedCirclePhoto,
  drawPalmTree,
  drawTerminalChip,
  paintGradient,
  roundRectPath,
  scuffRect,
  stickerJitter,
  strokeBuntingPill,
} from './motifs';
import { drawTravelStickersCollage } from './stickers';

// Translucent brand colours, resolved once — several of these are used by the
// dynamic layer, which repaints on every keystroke.
const INK_SHADOW = withAlpha(PALETTE.ink, 0.35);
const INK_SHADOW_HEAVY = withAlpha(PALETTE.ink, 0.45);
const INK_SHADOW_SOFT = withAlpha(PALETTE.ink, 0.32);
const INK_INNER = withAlpha(PALETTE.ink, 0.2);
const INK_CUT = withAlpha(PALETTE.ink, 0.4);
const CREAM_DIM = withAlpha(PALETTE.cream, 0.35);

export const CARD_W = 1080;
export const CARD_H = 1512;

const CX = CARD_W / 2;
const MARGIN = 72;

// Vertical rhythm, top to bottom.
const HEADER_CY = 112;
const SUN_C = { x: CX, y: 124, r: 66 };
const PHOTO = { cx: CX, cy: 560, photoR: 270, ringW: 28 };
const NAME_BASELINE = 972;
const RIBBON_CY = 1048;
const TITLE_CHIP_CY = 1144;
const HASHTAG_CY = 1316;
const TICKER = { x: 24, y: 1392, w: CARD_W - 48, h: 96 };
// QR (D3), applied as a hand-placed sticker: a cream plate, a dark cut line,
// and a slight rotation.
//
// The rotation is what constrains the size. Turning a square by 8° grows its
// bounding box by a factor of cos8 + sin8 ≈ 1.13, and the space between the
// title chip's lowest extent (1190 with the rare tier's offset shadow) and the
// ticker bar (1392) is only ~200px. Module size is what keeps the code
// scannable when the card is viewed scaled down, so the plate is sized to the
// largest square whose *rotated* box still fits.
const QR = {
  cx: 906,
  cy: 1291,
  size: 166, // the QR bitmap itself
  border: 5, // cream plate beyond the bitmap's own quiet zone
  angle: (8 * Math.PI) / 180,
};

// Exported so the QR bitmap is generated at exactly the size it's drawn —
// resampling a QR is what makes it stop scanning.
export const CARD_QR_SIZE = QR.size;

/**
 * @param {object} opts
 * @param {{text: string, tier: 'common'|'rare'}} opts.fields.builderTitle
 * @param {number|null} opts.sheen 0–1 progress of the one-shot rare sheen
 *   sweep, or null when it isn't running. Export renders always pass null —
 *   the rare tier stays legible without it via the outline + heavier shadow.
 */
export function drawCardFrame(ctx, opts) {
  drawCardStatic(ctx, opts);
  drawCardDynamic(ctx, opts);
}

/**
 * The vertical band the field-driven elements occupy: name (ascenders reach
 * ~876 at the largest size), role ribbon, and title chip including the rare
 * tier's offset shadow (lowest extent 1203).
 *
 * Restoring just this strip from the cached static layer is what makes a
 * keystroke cheap — see drawCardStatic.
 */
export const CARD_DYNAMIC_BAND = { y: 858, h: 340 };

/**
 * Everything that does NOT depend on the text fields: background art, header,
 * photo, hashtag pill, ticker and QR.
 *
 * Split out because it was dominating the keystroke path — a full card repaint
 * fills a 1080×1512 gradient, rescales the photo and reblits the QR, none of
 * which change when a name does. Callers cache this into an offscreen canvas
 * and only redraw it when the photo, QR or fonts change.
 *
 * Safe to draw entirely before the dynamic layer: the two groups don't overlap
 * (the chip bottoms out at 1203, the QR starts at 1206).
 */
export function drawCardStatic(
  ctx,
  { fonts, photo = null, qr = null, photoTransform = null, selectedStickers = null }
) {
  ctx.save();
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  paintGradient(ctx, CARD_W, CARD_H);
  drawSun(ctx);
  drawPalms(ctx);
  drawHeader(ctx, fonts);
  drawTravelStickersCollage(ctx, fonts, { selectedStickers });
  drawFramedCirclePhoto(ctx, { ...PHOTO, photoTransform }, photo);
  drawHashtagPill(ctx, fonts);
  drawTicker(ctx, fonts);
  drawQr(ctx, fonts, qr);
  drawLanyardSlot(ctx, fonts);

  ctx.restore();
}

/** The field-driven layer: name, role ribbon, builder-title chip. */
export function drawCardDynamic(ctx, { fonts, fields, sheen = null }) {
  const { name, role, builderTitle } = fields;

  ctx.save();
  drawName(ctx, fonts, name);
  drawRoleRibbon(ctx, fonts, role);
  drawTerminalChip(ctx, fonts, {
    cx: CX,
    cy: TITLE_CHIP_CY,
    text: `> title: "${builderTitle.text}"`,
    color: PALETTE.pink,
    fontSize: 30,
    maxWidth: CARD_W - MARGIN * 2,
    rare: builderTitle.tier === 'rare',
    sheen,
  });
  ctx.restore();
}

/* Background art --------------------------------------------------------- */

function drawSun(ctx) {
  // Flat yellow sun near the top edge, behind the header content — a
  // background anchor, not a foreground element (design.md §4).
  ctx.save();
  ctx.fillStyle = PALETTE.yellow;
  ctx.beginPath();
  ctx.arc(SUN_C.x, SUN_C.y, SUN_C.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PALETTE.yellow;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 + Math.PI / 10;
    ctx.beginPath();
    ctx.moveTo(SUN_C.x + Math.cos(a) * (SUN_C.r + 20), SUN_C.y + Math.sin(a) * (SUN_C.r + 20));
    ctx.lineTo(SUN_C.x + Math.cos(a) * (SUN_C.r + 52), SUN_C.y + Math.sin(a) * (SUN_C.r + 52));
    ctx.stroke();
  }
  ctx.restore();
}

function drawPalms(ctx) {
  // White line-art palm trees anchored at the bottom corners (§6). Trunk
  // bases run under the ticker bar, which is drawn later and covers them.
  ctx.save();
  ctx.strokeStyle = PALETTE.white;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawPalmTree(ctx, 120, 1120, 1, 1); // left corner, leaning right
  drawPalmTree(ctx, 1005, 1150, 0.85, -1); // right corner, leaning left

  ctx.restore();
}

/* Header ----------------------------------------------------------------- */

function drawHeader(ctx, fonts) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Wordmark lockup, top-left: serif caps + pink Devanagari script accent —
  // mirrors the site's lockup rather than inventing a new one (§6).
  const wordmark = 'HACKER HOUSE GOA';
  ctx.font = `900 34px ${fonts.display}`;
  const ww = ctx.measureText(wordmark).width;
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText(wordmark, MARGIN, HEADER_CY + 12);

  ctx.font = `700 44px ${fonts.script}`;
  ctx.fillStyle = PALETTE.pink;
  ctx.fillText('गोवा', MARGIN + ww + 20, HEADER_CY + 14);

  ctx.restore();

  drawTerminalChip(ctx, fonts, {
    right: CARD_W - MARGIN,
    cy: HEADER_CY,
    text: '> builder.goa[2026]',
    color: PALETTE.greenLight,
    fontSize: 22,
  });
}

/* Name ------------------------------------------------------------------- */

function drawName(ctx, fonts, name) {
  const text = name.toUpperCase();

  // Auto-shrink to fit — long names lose size, not letters (§6).
  //
  // Solved rather than scanned: stepping down 4px at a time meant up to 14
  // font assignments plus measureText per keystroke, and both are expensive.
  // Advance width is very nearly linear in font size, so one measurement at a
  // reference size predicts the right size directly; the follow-up measure
  // just absorbs any rounding/hinting error.
  const maxW = CARD_W - MARGIN * 2 - 76;
  const MAX_SIZE = 96;
  const MIN_SIZE = 44;

  ctx.font = `900 ${MAX_SIZE}px ${fonts.display}`;
  const refWidth = ctx.measureText(text).width;

  let fontSize = MAX_SIZE;
  if (refWidth > maxW) {
    fontSize = Math.max(MIN_SIZE, Math.floor((MAX_SIZE * maxW) / refWidth));
    ctx.font = `900 ${fontSize}px ${fonts.display}`;
    while (fontSize > MIN_SIZE && ctx.measureText(text).width > maxW) {
      fontSize -= 2;
      ctx.font = `900 ${fontSize}px ${fonts.display}`;
    }
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Hard offset duplicate behind the fill — the site's hero-title shadow is
  // flat, not a soft blur (§6).
  ctx.fillStyle = PALETTE.greenDeep;
  ctx.fillText(text, CX + 6, NAME_BASELINE + 8);
  ctx.fillStyle = PALETTE.yellow;
  ctx.fillText(text, CX, NAME_BASELINE);

  ctx.restore();
}

/* Role ribbon ------------------------------------------------------------ */

function drawRoleRibbon(ctx, fonts, role) {
  const text = role.toUpperCase();
  const fontSize = 38;
  ctx.save();
  ctx.font = `700 ${fontSize}px ${fonts.mono}`;
  ctx.letterSpacing = '2px';
  const tw = ctx.measureText(text).width;

  const h = 74;
  const padL = 52; // clears the left notch
  const arrow = 46; // triangular point on the right end (signpost, §4)
  const notch = 26; // V cut into the left end — the ribbon's tail
  const w = padL + tw + 28 + arrow;
  const x0 = CX - w / 2;
  const cy = RIBBON_CY;
  const top = cy - h / 2;
  const bot = cy + h / 2;

  // Six vertices: flat top, arrow point right, flat bottom, V-notch left.
  // `scuff` displaces each corner by a fixed sub-pixel amount so the cut edge
  // reads hand-trimmed rather than machine-straight; it is deterministic, so
  // it does not crawl between repaints.
  const ribbonPath = (dx, dy, scuff = 0) => {
    const j = (i) => (scuff ? stickerJitter(i, scuff) : 0);
    const path = new Path2D();
    path.moveTo(x0 + dx + j(1), top + dy + j(2));
    path.lineTo(x0 + w - arrow + dx + j(3), top + dy + j(4));
    path.lineTo(x0 + w + dx + j(5), cy + dy + j(6));
    path.lineTo(x0 + w - arrow + dx + j(7), bot + dy + j(8));
    path.lineTo(x0 + dx + j(9), bot + dy + j(10));
    path.lineTo(x0 + notch + dx + j(11), cy + dy + j(12));
    path.closePath();
    return path;
  };
  // Built once as a Path2D and reused: the base outline is painted three
  // times, and this sits on the keystroke path.
  const base = ribbonPath(0, 0);

  // Flat offset shadow, then the pink sign.
  ctx.fillStyle = INK_SHADOW;
  ctx.fill(ribbonPath(6, 8));
  ctx.fillStyle = PALETTE.pink;
  ctx.fill(base);

  // Worn inner edge, masked to the ribbon so the darkening hugs the cut line.
  //
  // Deliberately a crisp inset stroke rather than a blurred one: this runs on
  // the keystroke path, and shadowBlur inside a clip is among the slowest
  // canvas operations — it cost ~20ms per repaint on a 6x-throttled CPU. At
  // this scale the hard inset reads the same.
  // No clip: the stroke is centred on the edge so half of it spills outward,
  // and the cream outline below is drawn wider to cover exactly that spill.
  // Clipping here would be the single most expensive call in the dynamic
  // layer, and this reaches the same result.
  ctx.strokeStyle = INK_INNER;
  ctx.lineWidth = 3;
  ctx.stroke(base);

  // Scuffed cream die-cut outline.
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.stroke(ribbonPath(0, 0, 1.6));

  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x0 + padL, cy + fontSize * 0.34);
  ctx.letterSpacing = '0px';
  ctx.restore();
}

/* Hashtag pill ----------------------------------------------------------- */

function drawHashtagPill(ctx, fonts) {
  const text = '#FRAMEINGOA';
  ctx.save();
  ctx.font = `700 30px ${fonts.mono}`;
  ctx.letterSpacing = '3px';
  const tw = ctx.measureText(text).width;

  const h = 58;
  const pad = 36;
  const w = tw + pad * 2;
  const x0 = CX - w / 2;
  const y0 = HASHTAG_CY - h / 2;

  strokeBuntingPill(ctx, x0, y0, w, h);

  ctx.fillStyle = PALETTE.yellow;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, CX + 1, HASHTAG_CY + 10);
  ctx.letterSpacing = '0px';
  ctx.restore();
}

/* Ticker bar ------------------------------------------------------------- */

function drawTicker(ctx, fonts) {
  const { x, y, w, h } = TICKER;
  const cy = y + h / 2;
  const inset = 56;

  ctx.save();
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = PALETTE.ink;
  ctx.fill();

  // Worn inner edge. The bar is in the cached static layer, so a real blurred
  // inner shadow is affordable here — unlike on the ribbon, which repaints per
  // keystroke and uses a crisp inset instead.
  ctx.save();
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.clip();
  ctx.strokeStyle = INK_INNER;
  ctx.lineWidth = 3;
  ctx.shadowColor = INK_SHADOW_HEAVY;
  ctx.shadowBlur = 5;
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.stroke();
  ctx.restore();

  // Cream cut line, so the bar reads as an applied strip rather than a hole.
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 2;
  roundRectPath(ctx, x + 1, y + 1, w - 2, h - 2, h / 2 - 1);
  ctx.stroke();
  scuffRect(ctx, x, y, w, h, 6, 21);

  ctx.textBaseline = 'alphabetic';

  // Left: event details in mono (reads as data/tags, design.md §3).
  const left = 'GOA, INDIA · 28–31 OCT 2026';
  ctx.font = `400 25px ${fonts.mono}`;
  ctx.letterSpacing = '2px';
  ctx.fillStyle = PALETTE.cream;
  ctx.textAlign = 'left';
  ctx.fillText(left, x + inset, cy + 9);
  const leftEnd = x + inset + ctx.measureText(left).width;
  ctx.letterSpacing = '0px';

  // Right: wordmark in the display serif.
  const right = 'HH GOA 2026';
  ctx.font = `900 34px ${fonts.display}`;
  ctx.fillStyle = PALETTE.yellow;
  ctx.textAlign = 'right';
  ctx.fillText(right, x + w - inset, cy + 12);
  const rightStart = x + w - inset - ctx.measureText(right).width;

  // Divider dot, centered in the gap between the two runs.
  ctx.fillStyle = PALETTE.pink;
  ctx.beginPath();
  ctx.arc((leftEnd + rightStart) / 2, cy, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* QR --------------------------------------------------------------------- */

function drawQr(ctx, fonts, qr) {
  const half = QR.size / 2;
  const plate = QR.size / 2 + QR.border;

  ctx.save();
  // Rotate about the sticker's centre so it reads as applied by hand rather
  // than printed in register with the rest of the card.
  ctx.translate(QR.cx, QR.cy);
  ctx.rotate(QR.angle);

  // Flat offset shadow, matching the other stickers — this is what lifts it
  // off the card rather than looking inset into it.
  ctx.fillStyle = INK_SHADOW_SOFT;
  ctx.fillRect(-plate + 5, -plate + 7, plate * 2, plate * 2);

  // Cream plate: the sticker's die-cut border beyond the code's own quiet zone.
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(-plate, -plate, plate * 2, plate * 2);

  if (qr) {
    // Smoothing off: interpolating module edges is the fastest way to make a
    // QR unreadable, and the bitmap is generated at exactly the drawn size so
    // there is nothing to resample. Rotation still resamples, but the plate's
    // quiet zone gives the decoder the contrast it needs at the corners.
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, -half, -half, QR.size, QR.size);
  } else {
    // Generation failed or hasn't resolved yet — keep the slot occupied so the
    // composition doesn't reflow, rather than dropping the element entirely.
    ctx.fillStyle = CREAM_DIM;
    ctx.fillRect(-half, -half, QR.size, QR.size);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `700 26px ${fonts.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('QR', 0, 9);
  }

  // Thin dark cut line around the plate.
  ctx.strokeStyle = INK_CUT;
  ctx.lineWidth = 2;
  ctx.strokeRect(-plate + 1, -plate + 1, plate * 2 - 2, plate * 2 - 2);
  scuffRect(ctx, -plate, -plate, plate * 2, plate * 2, 4, 37);

  ctx.restore();
}

/* Lanyard Hardware & Woven Strap ----------------------------------------- */

function drawLanyardSlot(ctx, fonts) {
  ctx.save();

  const cx = CX;
  const slotY = 36;
  const slotW = 140;
  const slotH = 24;
  const rx = 12;

  // 1. Woven Fabric Lanyard Strap extending upward
  const strapW = 100;
  const strapBot = slotY + 18;

  // Strap Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  roundRectPath(ctx, cx - strapW / 2 + 4, -10, strapW, strapBot + 10, 6);
  ctx.fill();

  // Woven Strap Linear Gradient
  const strapGrad = ctx.createLinearGradient(cx - strapW / 2, 0, cx + strapW / 2, 0);
  strapGrad.addColorStop(0, '#062319');
  strapGrad.addColorStop(0.25, '#0f4c36');
  strapGrad.addColorStop(0.5, '#196b4d');
  strapGrad.addColorStop(0.75, '#0f4c36');
  strapGrad.addColorStop(1, '#062319');

  ctx.fillStyle = strapGrad;
  roundRectPath(ctx, cx - strapW / 2, -10, strapW, strapBot + 10, 6);
  ctx.fill();

  // Fine Woven Fabric Texture (Yellow stitch lines along edges)
  ctx.strokeStyle = PALETTE.yellow;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 4]);
  ctx.beginPath();
  ctx.moveTo(cx - strapW / 2 + 8, -10);
  ctx.lineTo(cx - strapW / 2 + 8, strapBot);
  ctx.moveTo(cx + strapW / 2 - 8, -10);
  ctx.lineTo(cx + strapW / 2 - 8, strapBot);
  ctx.stroke();
  ctx.setLineDash([]);

  // Strap Text Accent
  ctx.font = `800 12px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.yellow;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('HH GOA 2026', cx, 20);
  ctx.letterSpacing = '0px';

  // 2. Metallic Chrome / Gold Swivel Clip & D-Ring
  const clipY = slotY - 8;

  // Metallic Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.arc(cx + 3, clipY + 3, 24, 0, Math.PI * 2);
  ctx.fill();

  // Metallic D-Ring Outer
  const metalGrad = ctx.createLinearGradient(cx - 26, clipY - 26, cx + 26, clipY + 26);
  metalGrad.addColorStop(0, '#666666');
  metalGrad.addColorStop(0.2, '#ffffff');
  metalGrad.addColorStop(0.5, '#d4af37'); // Gold sheen accent
  metalGrad.addColorStop(0.8, '#ffffff');
  metalGrad.addColorStop(1, '#444444');

  ctx.strokeStyle = metalGrad;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, clipY, 20, 0, Math.PI * 2);
  ctx.stroke();

  // Metallic Specular Highlight
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, clipY, 20, Math.PI * 1.15, Math.PI * 1.45);
  ctx.stroke();

  // 3. ID Slot Hole (Punch Hole Cutout on Card)
  ctx.fillStyle = '#051811';
  roundRectPath(ctx, cx - slotW / 2, slotY - slotH / 2, slotW, slotH, rx);
  ctx.fill();

  // Reinforced Cream Slot Border Ring
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 3;
  roundRectPath(ctx, cx - slotW / 2, slotY - slotH / 2, slotW, slotH, rx);
  ctx.stroke();

  ctx.restore();
}
