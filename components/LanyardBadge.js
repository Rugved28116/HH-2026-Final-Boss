'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './LanyardBadge.module.css';

/**
 * Interactive Lanyard Badge Wrapper Component.
 * Adds a vintage woven event lanyard strap + metallic clip to the ID card,
 * with pendulum sway physics around the top clip pivot point when hovered.
 */
export default function LanyardBadge({ children, className = '' }) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let targetAngle = 0;
    let targetTiltY = 0;
    let currentAngle = 0;
    let currentTiltY = 0;

    const animate = () => {
      // Spring lerp towards target
      currentAngle += (targetAngle - currentAngle) * 0.12;
      currentTiltY += (targetTiltY - currentTiltY) * 0.12;

      el.style.setProperty('--sway-angle', `${currentAngle.toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${currentTiltY.toFixed(2)}deg`);

      if (
        Math.abs(targetAngle - currentAngle) > 0.01 ||
        Math.abs(targetTiltY - currentTiltY) > 0.01
      ) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = 0;
      }
    };

    const scheduleAnimate = () => {
      if (!raf) raf = requestAnimationFrame(animate);
    };

    const onPointerMove = (e) => {
      if (reduced.matches) return;
      const rect = el.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const relativeY = (e.clientY - rect.top) / rect.height; // 0 to 1

      // Pendulum sway around top center clip: horizontal displacement causes rotation angle (max ±6.5deg)
      targetAngle = relativeX * 12;
      // Subtle 3D tilt Y
      targetTiltY = relativeX * 8;

      scheduleAnimate();
    };

    const onPointerEnter = () => {
      if (!reduced.matches) setIsHovered(true);
    };

    const onPointerLeave = () => {
      setIsHovered(false);
      targetAngle = 0;
      targetTiltY = 0;
      scheduleAnimate();
    };

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerenter', onPointerEnter, { passive: true });
    el.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerenter', onPointerEnter);
      el.removeEventListener('pointerleave', onPointerLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={`${styles.badgeStage} ${className}`}>
      {/* Woven Festival Lanyard Strap */}
      <div className={styles.lanyardStrap} aria-hidden="true">
        <div className={styles.strapLeft}>
          <span className={styles.strapText}>HACKER HOUSE GOA 2026 • BEACH × BYTES •</span>
        </div>
        <div className={styles.strapRight}>
          <span className={styles.strapText}>HACKER HOUSE GOA 2026 • BEACH × BYTES •</span>
        </div>
      </div>

      {/* Metallic Bulldog Clip & Ring */}
      <div className={styles.clipGroup} aria-hidden="true">
        <div className={styles.lanyardRing} />
        <div className={styles.metallicClip}>
          <div className={styles.clipSpring} />
          <div className={styles.clipJaw} />
        </div>
      </div>

      {/* Swaying Card Container */}
      <div
        ref={containerRef}
        className={`${styles.cardSway} ${isHovered ? styles.cardHovered : ''}`}
      >
        {/* Punch Hole Slot on Card Top */}
        <div className={styles.slotPunch} aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
