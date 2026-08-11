'use client';

import styles from './SignpostRibbon.module.css';

/**
 * DOM counterpart of the card's signpost ribbon (design.md §4, drawn on canvas
 * by drawRoleRibbon in lib/render/card.js). Same construction — arrow-ended
 * right edge, pink fill, ink text, flat offset shadow — expressed as a
 * clip-path because the two live in different media and can't share a path.
 * If the canvas ribbon's proportions change, change these to match.
 */
export default function SignpostRibbon({ children, className = '' }) {
  return (
    <div className={`${styles.ribbon} ${className}`}>
      <span className={styles.text}>{children}</span>
    </div>
  );
}
