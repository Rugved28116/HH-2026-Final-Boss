'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import styles from './StickyHeader.module.css';

/**
 * Compact bar that slides in once the hero is scrolled past.
 *
 * Owns its own `past` state rather than letting HomeShell hold it: state up
 * there would re-render the entire generator (and its canvas effects) on every
 * scroll threshold crossing.
 *
 * IntersectionObserver on the hero instead of a scroll listener — it is
 * correct on first paint in both directions with no manual measurement, and it
 * self-corrects on resize and orientation change.
 */
export default function StickyHeader({ heroRef }) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const hero = heroRef?.current;
    if (!hero) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting),
      // Shrinking the root's top by 20% means the full-height hero stops
      // intersecting once roughly 80% of it has scrolled away, so the bar
      // arrives as the generator does rather than over the hero's own content.
      { threshold: 0, rootMargin: '-20% 0px 0px 0px' }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [heroRef]);

  return (
    <AnimatePresence>
      {past && (
        <m.header
          key="sticky"
          className={styles.bar}
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          <span className={styles.mark} aria-hidden="true">
            HH
          </span>
          <span className={styles.name}>Frame In Goa</span>
          <a className={styles.jump} href="#generator">
            Generator <span aria-hidden="true">↓</span>
          </a>
        </m.header>
      )}
    </AnimatePresence>
  );
}
