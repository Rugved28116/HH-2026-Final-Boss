'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './FlippableBadge.module.css';

/**
 * 3D Flippable Double-Sided Badge Component.
 * Front Side: Builder ID Card (1080x1512)
 * Back Side: PFP Frame (1080x1080)
 *
 * Integrates woven lanyard strap, metallic clip, pendulum sway, holographic foil sheen,
 * and 3D Y-axis 180° card flip.
 */
export default function FlippableBadge({
  isFlipped,
  onFlipToggle,
  frontContent,
  backContent,
  className = '',
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = () => {
    onFlipToggle();
  };

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
      currentAngle += (targetAngle - currentAngle) * 0.12;
      currentTiltY += (targetTiltY - currentTiltY) * 0.12;

      el.style.setProperty('--sway-angle', `${currentAngle.toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${currentTiltY.toFixed(2)}deg`);
      el.style.setProperty('--foil-pos', `${(50 + currentTiltY * 4).toFixed(1)}%`);

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
      const relativeX = (e.clientX - rect.left) / rect.width - 0.5;

      targetAngle = relativeX * 10;
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
      {/* Premium Woven Festival Lanyard Strap */}
      <div className={styles.lanyardStrap} aria-hidden="true">
        <div className={styles.strapLeft}>
          <span className={styles.strapText}>HACKER HOUSE GOA 2026</span>
        </div>
        <div className={styles.strapRight}>
          <span className={styles.strapText}>BEACH × BYTES</span>
        </div>
      </div>

      {/* Metallic Swivel Carabiner Clip & Ring Assembly */}
      <div className={styles.clipGroup} aria-hidden="true">
        <div className={styles.lanyardRing}>
          <div className={styles.ringInner} />
        </div>
        <div className={styles.metallicClip}>
          <div className={styles.clipSwivel} />
          <div className={styles.clipBody}>
            <div className={styles.clipSpring} />
          </div>
          <div className={styles.clipHook} />
        </div>
      </div>

      {/* 3D Sway & Flip Card Wrapper */}
      <div
        ref={containerRef}
        className={`${styles.cardSway} ${isHovered ? styles.cardHovered : ''}`}
      >
        {/* Slot Punch Hole on Card Header */}
        <div className={styles.slotPunch} aria-hidden="true" />

        {/* Holographic Specular Foil Sheen Overlay */}
        <div className={styles.holoFoil} aria-hidden="true" />

        {/* 3D Flip Container */}
        <div className={`${styles.flipCardInner} ${isFlipped ? styles.flipped : ''}`}>
          {/* Front Side: BUILDER ID CARD */}
          <div
            className={`${styles.cardFront} ${!isFlipped ? styles.activeFace : styles.inactiveFace}`}
          >
            <div className={styles.flipBanner}>
              <span className={styles.sideLabel}>FRONT // BUILDER ID CARD</span>
              <button
                type="button"
                className={styles.flipBtn}
                onClick={handleFlip}
                title="Flip to PFP Frame"
              >
                🔄 FLIP TO PFP FRAME ➔
              </button>
            </div>
            {frontContent}
          </div>

          {/* Back Side: PFP FRAME */}
          <div
            className={`${styles.cardBack} ${isFlipped ? styles.activeFace : styles.inactiveFace}`}
          >
            <div className={styles.flipBanner}>
              <span className={styles.sideLabel}>BACK // PFP FRAME</span>
              <button
                type="button"
                className={styles.flipBtn}
                onClick={handleFlip}
                title="Flip to Builder ID Card"
              >
                🔄 FLIP TO BUILDER ID ➔
              </button>
            </div>
            {backContent}
          </div>
        </div>
      </div>
    </div>
  );
}
