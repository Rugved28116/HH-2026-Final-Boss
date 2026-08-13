'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/** Keep in step with --header-h in globals.css (the sticky header's height). */
const HEADER_H = 60;

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      // Lenis takes over scrolling, and its own stylesheet forces
      // `scroll-behavior: auto !important`, so CSS smooth scrolling can't
      // work alongside it. This makes Lenis handle in-page anchors instead,
      // which is what the hero's "Start Building ↓" and the sticky header's
      // "Generator ↓" rely on.
      //
      // The offset is doing what `scroll-margin-top` would: Lenis computes its
      // own target and ignores that property, so without it the generator
      // lands underneath the sticky header instead of below it. Measured, not
      // guessed — at HEADER_H + 12 the tool's heading still cleared the bar by
      // only a pixel on a 1400x900 viewport.
      anchors: { offset: -(HEADER_H + 36) },
    });

    // Honour the OS setting: with reduced motion, jump instead of gliding.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      if (reduced.matches) lenis.stop();
      else lenis.start();
    };
    syncMotion();
    reduced.addEventListener('change', syncMotion);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      reduced.removeEventListener('change', syncMotion);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
