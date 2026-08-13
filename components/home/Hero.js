'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { useScrollParallax, usePointerParallax } from '@/lib/motion/parallax';
import { usePrefersReducedMotion } from '@/lib/motion/usePrefersReducedMotion';
import {
  container,
  containerInstant,
  item,
  itemInstant,
  wordGroup,
  wordGroupInstant,
} from '@/lib/motion/variants';
import styles from './Hero.module.css';

const HEADLINE = ['FRAME', 'IN', 'GOA'];

/**
 * Homepage hero. Sits above the generator; the two are one continuous scroll.
 *
 * The artwork is a *frame* — decorative border on all four edges (church,
 * lighthouse, signposts, palms) around an open green field. It is therefore
 * letterboxed rather than cropped at every breakpoint: `cover` would cut the
 * border off, and because the illustration's own field is the same
 * `--green-deep` as the section behind it, the letterbox bands are invisible.
 */
const Hero = forwardRef(function Hero({ count }, ref) {
  const bgRef = useRef(null);
  const textRef = useRef(null);
  const cueRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  // Both no-op on touch and under reduced motion, listeners fully detached.
  useScrollParallax(bgRef);
  usePointerParallax(textRef);

  // The image is not in the repo yet; without this the hero would show a
  // broken-image box instead of the green field it is designed to fall back to.
  const [bgFailed, setBgFailed] = useState(false);

  // Hide the scroll cue once the hero is mostly out of view. Writes a data
  // attribute directly rather than setState — this fires on scroll, and a
  // re-render here would re-render the generator below on every tick.
  useEffect(() => {
    const cue = cueRef.current;
    const hero = ref?.current;
    if (!cue || !hero) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        cue.dataset.hidden = entry.isIntersecting ? '' : 'true';
      },
      { threshold: 0.55 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [ref]);

  const v = reduced
    ? { container: containerInstant, item: itemInstant, word: wordGroupInstant }
    : { container, item, word: wordGroup };

  return (
    <section className={styles.hero} ref={ref}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgInner} ref={bgRef}>
          {!bgFailed && (
            <Image
              src="/hero-bg.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className={styles.bgImg}
              onError={() => setBgFailed(true)}
            />
          )}
        </div>
        <div className={styles.scrim} />
      </div>

      <div className={styles.pointerLayer} ref={textRef}>
        <m.div
          className={styles.content}
          variants={v.container}
          initial="hidden"
          animate="visible"
        >
          <m.p className={styles.eyebrow} variants={v.item}>
            HACKER HOUSE · GOA · 2026
          </m.p>

          {/* aria-label collapses the per-word spans back into one string for
              screen readers; the spans exist only so each word can animate. */}
          <m.h1 className={styles.headline} variants={v.word} aria-label="Frame in Goa">
            {HEADLINE.map((word) => (
              <m.span key={word} className={styles.word} variants={v.item}>
                {word}
              </m.span>
            ))}
          </m.h1>

          <m.p className={styles.subhead} variants={v.item}>
            Turn your photo into an official HH Goa 2026 graphic in seconds.
          </m.p>


        </m.div>
      </div>

      <div className={styles.cue} ref={cueRef} aria-hidden="true">
        <span className={styles.cueText}>SCROLL TO BUILD</span>
        <span className={styles.cueChevron}>↓</span>
      </div>
    </section>
  );
});

export default Hero;
