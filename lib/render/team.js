// Format C — Team Squad Frame, 1200×630 (OG image ratio). Layout spec:
// design.md §6b. Same contract as the other two renderers: pure draw module,
// one pass, no DOM or state.

import { PALETTE, withAlpha } from './palette';
import {
  drawFramedCirclePhoto,
  drawPalmTree,
  drawTerminalChip,
  paintGradient,
  roundRectPath,
  scuffRect,
} from './motifs';

const INK_SHADOW_HEAVY = withAlpha(PALETTE.ink, 0.45);
const INK_INNER = withAlpha(PALETTE.ink, 0.2);
const CREAM_DIM = withAlpha(PALETTE.cream, 0.42);
const CREAM_GHOST = withAlpha(PALETTE.cream, 0.55);

export const TEAM_W = 1200;
export const TEAM_H = 630;
export const TEAM_MAX_MEMBERS = 3;

const CX = TEAM_W / 2;
const MARGIN = 70;

// Vertical rhythm, top to bottom. The chips are the tight constraint: at
// fontSize 22 a terminal chip is 64px tall, and the rare tier adds a 9px offset
// shadow plus a 2.5px outline below that — so CHIP_CY ± 32 is really
// CHIP_CY + 43.5 at the bottom, which is what ROW_TOP has to clear.
const BAND = { y: 0, h: 80 };
const TEAM_NAME_BASELINE = 124;
const META_BASELINE = 152;
const CHIP_CY = 198;
const FOOTER = { x: 24, y: 556, w: TEAM_W - 48, h: 56 };

// The member row is laid out downward from a fixed top edge rather than around
// a fixed centre. Circles change size with the member count (see
// memberGeometry), and pinning the centre instead would walk the top edge up
// into the chip row as the radius grows.
const ROW_TOP = 246;
const ROW_BOTTOM = FOOTER.y - 6; // labels must clear the footer bar
const LABELS_H = 58; // name + "BUILDER 0N" beneath each circle
const SLOT_GAP = 24;

/**
 * Circle geometry for `count` active member slots.
 *
 * Two independent caps, whichever is smaller:
 *
 * - **Width** — `count` circles have to fit across 1060px of usable width.
 * - **Height** — the labels have to clear the footer bar.
 *
 * At a three-member maximum the height cap (123px) always wins: three circles
 * only need 164px of half-slot each, so the row never runs out of width. The
 * width term is kept because it is what makes the layout safe to raise
 * TEAM_MAX_MEMBERS against — at four it becomes the binding constraint and
 * shrinks the circles to 120px on its own.
 */
export function memberGeometry(count) {
  const slots = Math.max(1, Math.min(TEAM_MAX_MEMBERS, count));
  const avail = TEAM_W - MARGIN * 2;
  const slot = avail / slots;

  const byWidth = slot / 2 - SLOT_GAP / 2;
  const byHeight = (ROW_BOTTOM - ROW_TOP - LABELS_H) / 2;
  const outerR = Math.min(byWidth, byHeight);

  // Ring and bunting scale with the circle so the treatment reads identically
  // to Formats A and B at any size; the floors keep them visible at the
  // smallest radius the caps can produce.
  const ringW = Math.max(9, outerR * 0.095);
  const buntingGap = Math.max(10, outerR * 0.08);

  return {
    slots,
    slot,
    outerR,
    ringW,
    buntingGap,
    photoR: outerR - ringW - buntingGap,
    cy: ROW_TOP + outerR,
    cxFor: (i) => MARGIN + slot * (i + 0.5),
  };
}

/** "2:47 PM STUDIO" — the signature clock mark in the footer's right end. */
export function formatClock(date = new Date()) {
  const h = date.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${hour12}:${mins} ${h < 12 ? 'AM' : 'PM'} STUDIO`;
}

/**
 * @param {object} opts
 * @param {Array<{name: string, photo: CanvasImageSource|null}>} opts.members
 *   1–3 slots. A slot with `photo: null` renders its placeholder rather than
 *   collapsing, so the row keeps its shape while members are being added.
 * @param {{text: string, tier: 'common'|'rare'}} opts.builderClass
 * @param {number|null} opts.sheen 0–1 progress of the one-shot rare sweep.
 * @param {object|null} opts.photoTransform pan/zoom, member 1 only — it is the
 *   only slot wired to the nudge controls (app-flow.md §4b).
 */
export function drawTeamFrame(
  ctx,
  {
    fonts,
    teamName = '',
    members = [],
    builderClass = { text: '', tier: 'common' },
    passId = '',
    photoTransform = null,
    sheen = null,
    clock = null,
  }
) {
  const slots = members.length ? members.slice(0, TEAM_MAX_MEMBERS) : [{ name: '', photo: null }];
  const geo = memberGeometry(slots.length);

  ctx.save();
  ctx.clearRect(0, 0, TEAM_W, TEAM_H);

  paintGradient(ctx, TEAM_W, TEAM_H);
  drawPalms(ctx);
  drawHeaderBand(ctx, fonts);
  drawTitleBlock(ctx, fonts, teamName);
  drawChips(ctx, fonts, { builderClass, passId, sheen });
  drawMembers(ctx, fonts, slots, geo, photoTransform);
  drawFooter(ctx, fonts, clock);

  ctx.restore();
}

/* Background art --------------------------------------------------------- */

function drawPalms(ctx) {
  // Flanking both sides rather than the bottom corners (Format B's placement) —
  // a landscape canvas has no tall corner to hang them in, and the sides are
  // the only area the member row never occupies.
  ctx.save();
  ctx.strokeStyle = PALETTE.white;
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawPalmTree(ctx, 58, 292, 0.78, 1); // left, leaning right
  drawPalmTree(ctx, 1146, 268, 0.72, -1); // right, leaning left

  ctx.restore();
}

/* Header ----------------------------------------------------------------- */

function drawHeaderBand(ctx, fonts) {
  const { y, h } = BAND;

  ctx.save();
  ctx.fillStyle = PALETTE.yellow;
  ctx.fillRect(0, y, TEAM_W, h);

  // Cream cut line along the band's lower edge only — the other three sides run
  // off-canvas, and outlining those would draw a border around the artwork.
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, y + h - 1.25);
  ctx.lineTo(TEAM_W, y + h - 1.25);
  ctx.stroke();

  scuffRect(ctx, -4, y - 8, TEAM_W + 8, h + 8, 7, 91);

  ctx.fillStyle = PALETTE.ink;
  ctx.font = `900 38px ${fonts.display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '3px';
  ctx.fillText('HACKER HOUSE GOA 2026 · TEAM SQUAD', CX, y + 53);
  ctx.letterSpacing = '0px';

  ctx.restore();
}

function drawTitleBlock(ctx, fonts, teamName) {
  const text = (teamName || '').trim().toUpperCase() || 'YOUR TEAM';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Auto-shrink rather than overflow: the field caps at 32 characters, which
  // still overruns the canvas at the base size in a wide face.
  const maxW = TEAM_W - MARGIN * 2 - 60;
  let size = 44;
  ctx.font = `700 ${size}px ${fonts.mono}`;
  const measured = ctx.measureText(text).width;
  if (measured > maxW) {
    size = Math.max(24, Math.floor(size * (maxW / measured)));
    ctx.font = `700 ${size}px ${fonts.mono}`;
  }

  ctx.fillStyle = PALETTE.cream;
  ctx.letterSpacing = '2px';
  ctx.fillText(text, CX, TEAM_NAME_BASELINE);
  ctx.letterSpacing = '0px';

  ctx.font = `400 18px ${fonts.mono}`;
  ctx.fillStyle = CREAM_DIM;
  ctx.letterSpacing = '3px';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026', CX, META_BASELINE);
  ctx.letterSpacing = '0px';

  ctx.restore();
}

/* Class + pass chips ------------------------------------------------------ */

function drawChips(ctx, fonts, { builderClass, passId, sheen }) {
  const classText = builderClass?.text
    ? `> class: "${builderClass.text}"`
    : '> class: roll one';
  const rare = builderClass?.tier === 'rare';

  // Measured before drawing so the pair can be centred as a group — each chip
  // sizes itself to its own text, so their combined width isn't known up front.
  const widthOf = (text, fontSize) => {
    ctx.save();
    ctx.font = `700 ${fontSize}px ${fonts.mono}`;
    const w = 44 + ctx.measureText(text).width;
    ctx.restore();
    return w;
  };

  const passText = passId ? `pass ${passId}` : 'pass —';
  const classW = widthOf(classText, 22);
  const passW = widthOf(passText, 22);
  const gap = 26;
  const left = CX - (classW + gap + passW) / 2;

  // Small stickers, so a few degrees of tilt is safe here — unlike the header
  // and footer bars, where any rotation on a 1200px-wide element throws a
  // corner off-canvas.
  drawTiltedChip(ctx, fonts, {
    cx: left + classW / 2,
    cy: CHIP_CY,
    angle: (-3 * Math.PI) / 180,
    text: classText,
    color: PALETTE.pink,
    fontSize: 22,
    rare,
    sheen,
  });

  drawTiltedChip(ctx, fonts, {
    cx: left + classW + gap + passW / 2,
    cy: CHIP_CY,
    angle: (2.5 * Math.PI) / 180,
    text: passText,
    color: PALETTE.yellow,
    fontSize: 22,
  });
}

function drawTiltedChip(ctx, fonts, { cx, cy, angle, ...chip }) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  drawTerminalChip(ctx, fonts, { cx: 0, cy: 0, ...chip });
  ctx.restore();
}

/* Member row ------------------------------------------------------------- */

function drawMembers(ctx, fonts, slots, geo, photoTransform) {
  slots.forEach((member, i) => {
    const cx = geo.cxFor(i);

    if (member?.photo) {
      drawFramedCirclePhoto(
        ctx,
        {
          cx,
          cy: geo.cy,
          photoR: geo.photoR,
          ringW: geo.ringW,
          buntingGap: geo.buntingGap,
          // Only member 1 is wired to the nudge controls; the rest cover-fit.
          photoTransform: i === 0 ? photoTransform : null,
        },
        member.photo
      );
    } else {
      drawEmptySlot(ctx, fonts, cx, geo);
    }

    drawMemberLabels(ctx, fonts, cx, geo, member, i);
  });
}

function drawEmptySlot(ctx, fonts, cx, geo) {
  const { cy, photoR, ringW } = geo;

  ctx.save();

  // Dashed outline where the photo will land, so the slot reads as reserved
  // rather than broken. No solid yellow ring — that is what distinguishes a
  // filled member from a pending one at a glance.
  ctx.strokeStyle = CREAM_GHOST;
  ctx.lineWidth = 3;
  ctx.setLineDash([13, 11]);
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 9]);
  ctx.beginPath();
  ctx.arc(cx, cy, photoR + ringW, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  const size = Math.max(11, Math.round(photoR * 0.13));
  ctx.fillStyle = CREAM_DIM;
  ctx.font = `700 ${size}px ${fonts.mono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '1px';
  ctx.fillText('NO PHOTO', cx, cy - 2);
  ctx.fillText('UPLOADED', cx, cy + size + 6);
  ctx.letterSpacing = '0px';

  ctx.restore();
}

function drawMemberLabels(ctx, fonts, cx, geo, member, i) {
  const { cy, outerR } = geo;
  const nameSize = Math.max(15, Math.min(22, Math.round(outerR * 0.17)));
  const tagSize = Math.max(11, Math.round(nameSize * 0.72));

  const nameBaseline = cy + outerR + nameSize + 8;
  const tagBaseline = nameBaseline + tagSize + 9;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Small caps, matching the name treatment on Format B.
  const raw = (member?.name || '').trim().toUpperCase();
  const label = raw || `MEMBER ${String(i + 1).padStart(2, '0')}`;

  let size = nameSize;
  const maxW = geo.slot - SLOT_GAP;
  ctx.font = `700 ${size}px ${fonts.mono}`;
  const measured = ctx.measureText(label).width;
  if (measured > maxW) {
    size = Math.max(11, Math.floor(size * (maxW / measured)));
    ctx.font = `700 ${size}px ${fonts.mono}`;
  }

  ctx.fillStyle = raw ? PALETTE.cream : CREAM_DIM;
  ctx.fillText(label, cx, nameBaseline);

  // Yellow "BUILDER 0N" tag — the squad-lineup device that makes the row read
  // as a roster rather than a row of avatars.
  ctx.font = `400 ${tagSize}px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.yellow;
  ctx.letterSpacing = '2px';
  ctx.fillText(`BUILDER ${String(i + 1).padStart(2, '0')}`, cx, tagBaseline);
  ctx.letterSpacing = '0px';

  ctx.restore();
}

/* Footer ----------------------------------------------------------------- */

function drawFooter(ctx, fonts, clock) {
  const { x, y, w, h } = FOOTER;
  const cy = y + h / 2;
  const inset = 40;

  ctx.save();
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = PALETTE.ink;
  ctx.fill();

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

  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 2;
  roundRectPath(ctx, x + 1, y + 1, w - 2, h - 2, h / 2 - 1);
  ctx.stroke();
  scuffRect(ctx, x, y, w, h, 6, 37);

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // Segmented so the hashtag and the domain carry brand colour while the event
  // details stay cream — one flat cream run reads as a caption, not a ticker.
  const segments = [
    { text: '#FrameInGoa', color: PALETTE.yellow },
    { text: ' · ', color: PALETTE.pink },
    { text: 'Oct 28–31, 2026', color: PALETTE.cream },
    { text: ' · ', color: PALETTE.pink },
    { text: 'GOA, INDIA', color: PALETTE.cream },
    { text: ' · ', color: PALETTE.pink },
    { text: 'hhgoa.com', color: PALETTE.yellow },
  ];

  ctx.font = `700 20px ${fonts.mono}`;
  ctx.letterSpacing = '1px';
  let tx = x + inset;
  for (const seg of segments) {
    ctx.fillStyle = seg.color;
    ctx.fillText(seg.text, tx, cy + 7);
    tx += ctx.measureText(seg.text).width;
  }
  ctx.letterSpacing = '0px';

  // Clock mark, right end. VT323 is reserved for exactly this kind of accent
  // (design.md §3) — a digital readout, used once per composition.
  ctx.font = `400 30px ${fonts.lcd || fonts.mono}`;
  ctx.fillStyle = PALETTE.greenLight;
  ctx.textAlign = 'right';
  ctx.fillText(clock || formatClock(), x + w - inset, cy + 9);

  ctx.restore();
}
