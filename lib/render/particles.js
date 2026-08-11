// Torn-paper confetti burst for the D1 reveal (design.md §10).
//
// Deliberately not circular sparkles: small irregular quadrilaterals that
// tumble and flip read as paper scraps, which is the poster-craft register the
// rest of the design sits in.
//
// This draws to its own overlay canvas, never the export canvas — particles
// must not end up baked into the downloaded PNG.

import { PALETTE } from './palette';

const GRAVITY = 900; // px/s²
const DRAG = 0.88; // per second
const LIFE_MIN = 620;
const LIFE_MAX = 940;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Spawns particles around the perimeter of a rect, each flying outward.
 *
 * @param {{x:number,y:number,w:number,h:number}} edge the canvas rect in
 *   overlay coordinates (the overlay is larger, so scraps can travel past the
 *   canvas edge instead of being clipped at it)
 */
export function spawnBurst(edge, count = 40) {
  const particles = [];
  const perimeter = 2 * (edge.w + edge.h);

  for (let i = 0; i < count; i++) {
    // Walk the perimeter at even intervals plus jitter, so the burst reads as
    // a ring rather than four separate corner clumps.
    const d = ((i + rand(-0.35, 0.35)) / count) * perimeter;
    let x;
    let y;
    let nx;
    let ny;
    if (d < edge.w) {
      x = edge.x + d;
      y = edge.y;
      nx = 0;
      ny = -1;
    } else if (d < edge.w + edge.h) {
      x = edge.x + edge.w;
      y = edge.y + (d - edge.w);
      nx = 1;
      ny = 0;
    } else if (d < 2 * edge.w + edge.h) {
      x = edge.x + edge.w - (d - edge.w - edge.h);
      y = edge.y + edge.h;
      nx = 0;
      ny = 1;
    } else {
      x = edge.x;
      y = edge.y + edge.h - (d - 2 * edge.w - edge.h);
      nx = -1;
      ny = 0;
    }

    const speed = rand(90, 260);
    particles.push({
      x,
      y,
      // Outward along the edge normal, with tangential scatter and a slight
      // upward bias so it falls like paper rather than spraying symmetrically.
      vx: nx * speed + rand(-70, 70),
      vy: ny * speed + rand(-70, 70) - 60,
      w: rand(5, 11),
      h: rand(7, 16),
      rot: rand(0, Math.PI * 2),
      vrot: rand(-7, 7),
      flip: rand(0, Math.PI * 2),
      vflip: rand(5, 13),
      // Jittered corners, fixed per particle — a torn scrap, not a rectangle.
      tear: [rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)],
      color: Math.random() < 0.5 ? PALETTE.yellow : PALETTE.pink,
      age: 0,
      life: rand(LIFE_MIN, LIFE_MAX),
    });
  }
  return particles;
}

/**
 * Advances and draws one frame. Returns true while any particle is still
 * alive, so the caller knows when to stop the rAF loop and clear the overlay.
 *
 * Clears per particle rather than the whole overlay: the scraps only ever
 * occupy a thin band near the edges, so clearing the full rect spends most of
 * its time on the large empty interior. Measurably fewer dropped frames.
 */
export function stepBurst(ctx, particles, dtMs) {
  const dt = dtMs / 1000;

  // Erase last frame's marks first, so overlapping scraps can't clear each
  // other's freshly drawn pixels.
  for (const p of particles) {
    if (p.clear) ctx.clearRect(p.clear[0], p.clear[1], p.clear[2], p.clear[3]);
    p.clear = null;
  }

  let alive = false;
  for (const p of particles) {
    p.age += dtMs;
    if (p.age >= p.life) continue;
    alive = true;

    const drag = DRAG ** dt;
    p.vx *= drag;
    p.vy = p.vy * drag + GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vrot * dt;
    p.flip += p.vflip * dt;

    // Fade only over the last stretch of life, so the burst stays crisp and
    // then leaves cleanly rather than looking permanently translucent.
    const t = p.age / p.life;
    ctx.globalAlpha = t < 0.62 ? 1 : 1 - (t - 0.62) / 0.38;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    // Tumbling toward edge-on and back; never fully degenerate.
    ctx.scale(1, Math.max(0.18, Math.abs(Math.cos(p.flip))));

    const hw = p.w / 2;
    const hh = p.h / 2;
    const [a, b, c, d] = p.tear;
    ctx.beginPath();
    ctx.moveTo(-hw + a * hw, -hh);
    ctx.lineTo(hw, -hh + b * hh);
    ctx.lineTo(hw + c * hw, hh);
    ctx.lineTo(-hw, hh + d * hh);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();

    // Box to erase next frame. Rotation and the torn-corner jitter push the
    // shape past its nominal w/h, so pad generously — a too-small box leaves
    // streaks behind the scrap.
    const reach = Math.max(p.w, p.h) * 1.5 + 3;
    p.clear = [p.x - reach, p.y - reach, reach * 2, reach * 2];
  }

  ctx.globalAlpha = 1;
  return alive;
}
