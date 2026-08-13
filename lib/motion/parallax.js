'use client';

import { useEffect } from 'react';

/**
 * Parallax written as CSS custom properties from inside a single rAF — the
 * pattern BackdropDoodles established, rather than framer's useScroll.
 *
 * The deciding factor is detachability: the requirement is *no listener at all*
 * on touch devices or under reduced motion, and a useScroll subscription can
 * only be ignored, not removed. These hooks tear the listener down completely
 * and reset the custom property, so a device that flips to coarse pointer or a
 * user who enables reduced motion mid-session pays nothing.
 */

/** Vertical drift on scroll. Desktop only, capped so it can't run off. */
export function useScrollParallax(ref, { factor = 0.3, max = 120 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // `(pointer: fine)` alone, not the `(hover: hover) and (pointer: fine)`
    // pair BackdropDoodles uses: scroll parallax doesn't need a hover-capable
    // device, it only needs to not be a touchscreen.
    const fine = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;

    const apply = () => {
      raf = 0;
      const y = Math.min(max, window.scrollY * factor);
      el.style.setProperty('--par-scroll-y', `${y.toFixed(1)}px`);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const detach = () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.setProperty('--par-scroll-y', '0px');
    };

    const sync = () => {
      detach();
      if (fine.matches && !reduced.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        // Seed it: a refresh or bfcache restore can land mid-page, where the
        // correct offset is not zero and no scroll event is coming.
        apply();
      }
    };

    sync();
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      detach();
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [ref, factor, max]);
}

/** Small counter-cursor shift, for depth against the background. Desktop only. */
export function usePointerParallax(ref, { max = 7 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty('--par-x', `${x.toFixed(1)}px`);
      el.style.setProperty('--par-y', `${y.toFixed(1)}px`);
    };

    const onMove = (event) => {
      // Negated: the layer leans away from the cursor, which reads as depth.
      x = -((event.clientX / window.innerWidth) * 2 - 1) * max;
      y = -((event.clientY / window.innerHeight) * 2 - 1) * max;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const detach = () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.setProperty('--par-x', '0px');
      el.style.setProperty('--par-y', '0px');
    };

    const sync = () => {
      detach();
      if (fine.matches && !reduced.matches) {
        window.addEventListener('pointermove', onMove, { passive: true });
      }
    };

    sync();
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      detach();
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [ref, max]);
}
