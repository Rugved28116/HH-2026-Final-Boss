// Vintage 1930s-50s luggage labels & travel stickers collage generator.
// Renders vector luggage labels (shields, scalloped circles, octagons, ribbons)
// directly onto the Builder ID Card canvas for an authentic collected-over-years travel look.

import { PALETTE, withAlpha } from './palette';
import { roundRectPath, scuffCircle, scuffRect, stickerJitter, stickerNoise } from './motifs';

const INK_SHADOW = withAlpha(PALETTE.ink, 0.35);
const INK_INNER = withAlpha(PALETTE.ink, 0.18);
const CREAM_DIE_CUT = PALETTE.cream;

/**
 * Main entry point: paints the vintage luggage stickers collage on the ID card canvas.
 * Called inside drawCardStatic so it composites into the static layer cache without
 * impacting field-typing performance.
 */
export function drawTravelStickersCollage(
  ctx,
  fonts,
  { selectedStickers = null, palette = PALETTE } = {}
) {
  ctx.save();

  const enabled = (id) => !selectedStickers || selectedStickers.includes(id);

  // 1. Top-Right Shield Sticker (GOA INDIA · HOTEL DEL MAR)
  if (enabled('shield')) {
    drawShieldSticker(ctx, fonts, {
      cx: 935,
      cy: 275,
      w: 175,
      h: 215,
      angle: (-9 * Math.PI) / 180,
      palette,
    });
  }

  // 2. Left Margin Scalloped Circular Sticker (PORT OF GOA · STEAMSHIP CO.)
  if (enabled('scallop')) {
    drawScallopedSticker(ctx, fonts, {
      cx: 145,
      cy: 425,
      r: 95,
      teeth: 18,
      angle: (12 * Math.PI) / 180,
      palette,
    });
  }

  // 3. Right Mid Margin Octagon Sticker (CALANGUTE BEACH)
  if (enabled('octagon')) {
    drawOctagonSticker(ctx, fonts, {
      cx: 950,
      cy: 710,
      w: 165,
      h: 125,
      angle: (-7 * Math.PI) / 180,
      palette,
    });
  }

  // 4. Lower-Left Ribbon Banner Sticker (VIA AIR MAIL · GOA 1952)
  if (enabled('airmail')) {
    drawAirMailSticker(ctx, fonts, {
      cx: 185,
      cy: 1185,
      w: 245,
      h: 62,
      angle: (8 * Math.PI) / 180,
      palette,
    });
  }

  // 5. Postal Cancellation Stamp Seal (GOA CUSTOMS · PASSED)
  if (enabled('stamp')) {
    drawPostalCancelStamp(ctx, fonts, {
      cx: 775,
      cy: 335,
      angle: (-14 * Math.PI) / 180,
      palette,
    });
  }

  ctx.restore();
}

/* 1. Shield Sticker (Mustard Yellow badge, Palm & Sun landmark, GOA INDIA) ----- */

function drawShieldSticker(ctx, fonts, { cx, cy, w, h, angle }) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const hw = w / 2;
  const hh = h / 2;

  // Drop shadow
  ctx.save();
  ctx.fillStyle = INK_SHADOW;
  ctx.beginPath();
  pathShield(ctx, 4, 6, hw, hh);
  ctx.fill();
  ctx.restore();

  // Die-cut cream outline
  ctx.fillStyle = CREAM_DIE_CUT;
  ctx.beginPath();
  pathShield(ctx, 0, 0, hw + 3, hh + 3);
  ctx.fill();

  // Shield body fill (Mustard Yellow)
  ctx.fillStyle = PALETTE.yellow;
  ctx.beginPath();
  pathShield(ctx, 0, 0, hw, hh);
  ctx.fill();

  // Inner border cut line
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  pathShield(ctx, 0, 0, hw - 6, hh - 6);
  ctx.stroke();

  // Inner decorative dashed line
  ctx.strokeStyle = withAlpha(PALETTE.pink, 0.7);
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  pathShield(ctx, 0, 0, hw - 14, hh - 14);
  ctx.stroke();
  ctx.setLineDash([]);

  // Landmark illustration: Minimal flat palm tree & sun
  ctx.save();
  ctx.translate(0, -hh + 54);

  // Sun
  ctx.fillStyle = PALETTE.pink;
  ctx.beginPath();
  ctx.arc(0, -4, 16, 0, Math.PI * 2);
  ctx.fill();

  // Palm fronds
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(0, 0, -4, -12);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-4, -12); ctx.quadraticCurveTo(-18, -20, -26, -10);
  ctx.moveTo(-4, -12); ctx.quadraticCurveTo(10, -20, 18, -10);
  ctx.moveTo(-4, -12); ctx.quadraticCurveTo(-14, -28, -8, -32);
  ctx.moveTo(-4, -12); ctx.quadraticCurveTo(6, -28, 12, -30);
  ctx.stroke();
  ctx.restore();

  // Typography: GOA INDIA
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `900 24px ${fonts.display}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText('GOA', 0, 12);

  ctx.font = `700 13px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.pink;
  ctx.fillText('• INDIA •', 0, 36);

  ctx.font = `700 10px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText('EST. 1952', 0, 58);

  // Vintage scuff nicks
  scuffCircle(ctx, 0, 0, hw - 4, 4, 101);

  ctx.restore();
}

function pathShield(ctx, ox, oy, hw, hh) {
  const topR = 12;
  ctx.moveTo(ox - hw + topR, oy - hh);
  ctx.lineTo(ox + hw - topR, oy - hh);
  ctx.quadraticCurveTo(ox + hw, oy - hh, ox + hw, oy - hh + topR);
  ctx.lineTo(ox + hw, oy + hh * 0.35);
  ctx.quadraticCurveTo(ox + hw, oy + hh * 0.7, ox, oy + hh);
  ctx.quadraticCurveTo(ox - hw, oy + hh * 0.7, ox - hw, oy + hh * 0.35);
  ctx.lineTo(ox - hw, oy - hh + topR);
  ctx.quadraticCurveTo(ox - hw, oy - hh, ox - hw + topR, oy - hh);
  ctx.closePath();
}

/* 2. Scalloped Sticker (Faded Red/Pink circular badge, Steamship Co.) ---------- */

function drawScallopedSticker(ctx, fonts, { cx, cy, r, teeth, angle }) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Drop shadow
  ctx.save();
  ctx.fillStyle = INK_SHADOW;
  ctx.beginPath();
  pathScallop(ctx, 4, 5, r, teeth);
  ctx.fill();
  ctx.restore();

  // Die-cut cream plate
  ctx.fillStyle = CREAM_DIE_CUT;
  ctx.beginPath();
  pathScallop(ctx, 0, 0, r + 3, teeth);
  ctx.fill();

  // Main sticker fill (Faded Red/Pink)
  ctx.fillStyle = PALETTE.pink;
  ctx.beginPath();
  pathScallop(ctx, 0, 0, r, teeth);
  ctx.fill();

  // Inner dashed cream ring
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, r - 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner ink circle plate
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.arc(0, 0, r - 26, 0, Math.PI * 2);
  ctx.fill();

  // Flat-icon Landmark: Vintage Steamship / Boat
  ctx.save();
  ctx.strokeStyle = PALETTE.yellow;
  ctx.fillStyle = PALETTE.yellow;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Hull
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.lineTo(20, -2);
  ctx.lineTo(14, 12);
  ctx.lineTo(-18, 12);
  ctx.closePath();
  ctx.fill();

  // Funnel & smoke
  ctx.fillRect(-6, -14, 8, 12);
  ctx.beginPath();
  ctx.arc(4, -18, 3, 0, Math.PI * 2);
  ctx.arc(12, -22, 4, 0, Math.PI * 2);
  ctx.stroke();

  // Waves under ship
  ctx.beginPath();
  ctx.moveTo(-28, 18); ctx.quadraticCurveTo(-14, 14, 0, 18); ctx.quadraticCurveTo(14, 22, 28, 18);
  ctx.stroke();
  ctx.restore();

  // Curved text: PORT OF GOA
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 12px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.yellow;
  ctx.fillText('PORT OF GOA', 0, -r + 20);

  ctx.font = `700 10px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText('STEAMSHIP CO.', 0, r - 20);
  ctx.restore();

  // Edge scuffing
  scuffCircle(ctx, 0, 0, r, 5, 202);

  ctx.restore();
}

function pathScallop(ctx, ox, oy, r, teeth) {
  const step = (Math.PI * 2) / teeth;
  const innerR = r - 6;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a1 = i * step;
    const a2 = a1 + step / 2;
    const a3 = (i + 1) * step;
    const x1 = ox + Math.cos(a1) * r;
    const y1 = oy + Math.sin(a1) * r;
    const x2 = ox + Math.cos(a2) * innerR;
    const y2 = oy + Math.sin(a2) * innerR;
    if (i === 0) ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, ox + Math.cos(a3) * r, oy + Math.sin(a3) * r);
  }
  ctx.closePath();
}

/* 3. Octagon Sticker (Cream plate, Calangute Beach Resort) ----------------------- */

function drawOctagonSticker(ctx, fonts, { cx, cy, w, h, angle }) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const hw = w / 2;
  const hh = h / 2;
  const c = 22; // corner chamfer

  // Drop shadow
  ctx.save();
  ctx.fillStyle = INK_SHADOW;
  ctx.beginPath();
  pathOctagon(ctx, 4, 5, hw, hh, c);
  ctx.fill();
  ctx.restore();

  // Die-cut cream plate
  ctx.fillStyle = CREAM_DIE_CUT;
  ctx.beginPath();
  pathOctagon(ctx, 0, 0, hw + 3, hh + 3, c);
  ctx.fill();

  // Main sticker fill (Cream)
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  pathOctagon(ctx, 0, 0, hw, hh, c);
  ctx.fill();

  // Double border line
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  pathOctagon(ctx, 0, 0, hw - 5, hh - 5, c - 2);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.pink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pathOctagon(ctx, 0, 0, hw - 10, hh - 10, c - 4);
  ctx.stroke();

  // Content: Wave landmark icon + Calangute Beach
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Minimal lighthouse / waves icon
  ctx.save();
  ctx.strokeStyle = PALETTE.ink;
  ctx.fillStyle = PALETTE.pink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -22); ctx.lineTo(10, -22); ctx.lineTo(6, -42); ctx.lineTo(-6, -42); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();

  ctx.font = `900 18px ${fonts.display}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText('CALANGUTE', 0, -2);

  ctx.font = `700 11px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.pink;
  ctx.fillText('BEACH RESORT', 0, 20);

  scuffRect(ctx, -hw, -hh, w, h, 4, 303);

  ctx.restore();
}

function pathOctagon(ctx, ox, oy, hw, hh, c) {
  ctx.moveTo(ox - hw + c, oy - hh);
  ctx.lineTo(ox + hw - c, oy - hh);
  ctx.lineTo(ox + hw, oy - hh + c);
  ctx.lineTo(ox + hw, oy + hh - c);
  ctx.lineTo(ox + hw - c, oy + hh);
  ctx.lineTo(ox - hw + c, oy + hh);
  ctx.lineTo(ox - hw, oy + hh - c);
  ctx.lineTo(ox - hw, oy - hh + c);
  ctx.closePath();
}

/* 4. Air Mail Banner Sticker (VIA AIR MAIL · GOA 1952) -------------------------- */

function drawAirMailSticker(ctx, fonts, { cx, cy, w, h, angle }) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const hw = w / 2;
  const hh = h / 2;

  // Drop shadow
  ctx.save();
  ctx.fillStyle = INK_SHADOW;
  ctx.beginPath();
  roundRectPath(ctx, -hw + 3, -hh + 4, w, h, 14);
  ctx.fill();
  ctx.restore();

  // Die-cut outline
  ctx.fillStyle = CREAM_DIE_CUT;
  ctx.beginPath();
  roundRectPath(ctx, -hw - 3, -hh - 3, w + 6, h + 6, 16);
  ctx.fill();

  // Yellow banner fill
  ctx.fillStyle = PALETTE.yellow;
  ctx.beginPath();
  roundRectPath(ctx, -hw, -hh, w, h, 14);
  ctx.fill();

  // Dashed pink bunting border
  ctx.strokeStyle = PALETTE.pink;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  roundRectPath(ctx, -hw + 4, -hh + 4, w - 8, h - 8, 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Content: Star + AIR MAIL typography
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `700 14px ${fonts.mono}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText('✈ VIA AIR MAIL • GOA', 0, 0);

  scuffRect(ctx, -hw, -hh, w, h, 3, 404);

  ctx.restore();
}

/* 5. Postal Cancellation Stamp Seal (GOA CUSTOMS · PASSED) ----------------------- */

function drawPostalCancelStamp(ctx, fonts, { cx, cy, angle }) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.55;

  ctx.strokeStyle = PALETTE.pink;
  ctx.fillStyle = PALETTE.pink;
  ctx.lineWidth = 2;

  // Double circle stamp
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.stroke();

  // Wavy cancellation lines extending right
  for (let i = -2; i <= 2; i++) {
    const yOff = i * 12;
    ctx.beginPath();
    ctx.moveTo(52, yOff);
    ctx.quadraticCurveTo(72, yOff - 6, 92, yOff);
    ctx.quadraticCurveTo(112, yOff + 6, 132, yOff);
    ctx.stroke();
  }

  // Stamp typography
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `700 11px ${fonts.mono}`;
  ctx.fillText('GOA CUSTOMS', 0, -14);

  ctx.font = `900 14px ${fonts.display}`;
  ctx.fillText('PASSED', 0, 4);

  ctx.font = `700 10px ${fonts.mono}`;
  ctx.fillText('1952 · OK', 0, 20);

  ctx.restore();
}
