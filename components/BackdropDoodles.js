'use client';

import { useEffect, useRef } from 'react';
import styles from './BackdropDoodles.module.css';

const MAX_SHIFT = 18;

/**
 * Clean Ambient Mesh Backdrop featuring shifting light orbs, vignette,
 * blueprint matrix grid, and top-right decals.
 */
export default function BackdropDoodles() {
  const ref = useRef(null);

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
      el.style.setProperty('--par-x', `${x}px`);
      el.style.setProperty('--par-y', `${y}px`);
    };

    const onMove = (event) => {
      x = -((event.clientX / window.innerWidth) * 2 - 1) * MAX_SHIFT;
      y = -((event.clientY / window.innerHeight) * 2 - 1) * MAX_SHIFT;
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
  }, []);

  return (
    <div ref={ref} className={styles.backdrop} aria-hidden="true">
      {/* 1. Shifting Ambient Mesh Orbs */}
      <div className={`${styles.ambientOrb} ${styles.orbGold}`} />
      <div className={`${styles.ambientOrb} ${styles.orbPink}`} />
      <div className={`${styles.ambientOrb} ${styles.orbGreen}`} />

      {/* 2. Vintage Vignette */}
      <div className={styles.vignette} />

      {/* 3. Blueprint Matrix Grid Overlay */}
      <div className={styles.codeGridPattern} />

      {/* 4. CS Microchip Circuit Trace (Top Right Margin Only) */}
      <svg className={styles.circuitChip} style={{ '--depth': 0.7 }} viewBox="0 0 160 160" fill="none">
        <rect x="40" y="40" width="80" height="80" rx="8" strokeWidth="2" />
        <path d="M60 60H100V100H60Z" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M60 10V40M80 10V40M100 10V40M60 120V150M80 120V150M100 120V150" strokeWidth="1.5" />
        <path d="M10 60H40M10 80H40M10 100H40M120 60H150M120 80H150M120 100H150" strokeWidth="1.5" />
      </svg>

      {/* 5. Palm Frond Line Art (Top Right Corner Only) */}
      <svg className={styles.frond} style={{ '--depth': 0.9 }} viewBox="0 0 200 180" fill="none">
        <path d="M4 170 Q30 60 180 12" />
        <path d="M32 128 Q60 96 92 108" />
        <path d="M48 104 Q78 74 112 84" />
        <path d="M70 80 Q102 54 136 62" />
      </svg>

      {/* 6. Star Decal (Far Right Margin Only) */}
      <svg className={`${styles.decal} ${styles.decalStar}`} style={{ '--depth': 0.6 }} viewBox="0 0 64 64">
        <circle className={styles.decalPlate} cx="32" cy="32" r="29" />
        <path
          className={styles.decalMark}
          d="M32 13l5.6 11.9L50 26.7l-9 9.2 2.2 13L32 42.7 20.8 48.9l2.2-13-9-9.2 12.4-1.8z"
        />
      </svg>
    </div>
  );
}
