'use client';

import { useEffect, useRef } from 'react';
import { spawnBurst, stepBurst } from '@/lib/render/particles';
import styles from './RevealCanvas.module.css';

// How far past the canvas edge scraps may travel before being clipped.
const OVERLAY_PAD = 72;

/**
 * The export canvas plus its reveal (D1): a scale+fade on the canvas itself
 * and a torn-paper burst on a separate overlay.
 *
 * The overlay is what keeps the export clean — particles never touch the
 * canvas the download reads from.
 *
 * @param {number} revealToken increment to play the reveal; 0 means never
 *   played. Changing it does NOT remount the canvas, which would discard the
 *   painted bitmap.
 */
export default function RevealCanvas({
  canvasRef,
  width,
  height,
  className = '',
  ariaLabel,
  revealToken = 0,
}) {
  const overlayRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!revealToken) return undefined;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas) return undefined;

    // Restart the CSS animation. Removing the class and forcing a reflow is
    // the only way to replay it without remounting the element.
    canvas.classList.remove(styles.reveal);
    void canvas.offsetWidth;
    canvas.classList.add(styles.reveal);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !overlay) return undefined; // CSS handles the plain fade

    // Size the overlay to the canvas as displayed, not as exported — the
    // canvas is CSS-scaled and the burst has to line up with what's on screen.
    const rect = canvas.getBoundingClientRect();
    // A hidden format (the inactive tab) measures zero; there is nothing to
    // burst around, and spawning into a 0×0 overlay would divide by zero.
    if (rect.width < 1 || rect.height < 1) return undefined;

    // Cap DPR: past 2 the overlay costs 4x the fill rate for no visible gain
    // on a decorative effect.
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = rect.width + OVERLAY_PAD * 2;
    const cssH = rect.height + OVERLAY_PAD * 2;
    overlay.width = Math.round(cssW * dpr);
    overlay.height = Math.round(cssH * dpr);

    const ctx = overlay.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particles = spawnBurst({
      x: OVERLAY_PAD,
      y: OVERLAY_PAD,
      w: rect.width,
      h: rect.height,
    });

    let last = performance.now();
    let slow = 0;
    let culls = 0;
    const started = last;

    const frame = (now) => {
      const raw = now - last;
      // Clamp dt so a background tab or a long task doesn't teleport the
      // scraps off-screen in a single step.
      const dt = Math.min(48, raw);
      last = now;

      // Degrade rather than stutter on a slow device (design.md §10: motion is
      // additive polish). Sustained long frames thin the burst out, and if
      // that isn't enough it ends early — a short burst beats a janky one.
      if (raw > 34) slow += 1;
      else slow = Math.max(0, slow - 1);

      if (slow >= 4 && particles.length > 6) {
        slow = 0;
        culls += 1;
        const keep = Math.ceil(particles.length / 2);
        // Erase the culled scraps' last frame, or they'd be left painted on.
        for (const p of particles.slice(keep)) {
          if (p.clear) ctx.clearRect(p.clear[0], p.clear[1], p.clear[2], p.clear[3]);
        }
        particles.length = keep;
      }

      const giveUp = culls >= 2 && slow >= 4;
      if (!giveUp && now - started < 2000 && stepBurst(ctx, particles, dt)) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cssW, cssH);
        rafRef.current = 0;
      }
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ctx.clearRect(0, 0, cssW, cssH);
    };
  }, [revealToken, canvasRef]);

  return (
    <span className={styles.stage}>
      <canvas ref={canvasRef} width={width} height={height} className={className} aria-label={ariaLabel} />
      {/* Purely decorative and never interactive: it sits over the canvas and
          the controls beside it, so it must not intercept clicks. */}
      <canvas ref={overlayRef} className={styles.overlay} aria-hidden="true" />
    </span>
  );
}
