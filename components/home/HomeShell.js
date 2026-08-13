'use client';

import { useRef } from 'react';
import BackdropDoodles from '@/components/BackdropDoodles';
import GeneratorTool from '@/components/GeneratorTool';
import MotionProvider from '@/components/MotionProvider';
import Hero from './Hero';
import StickyHeader from './StickyHeader';
import { useCounter } from '@/lib/counter/useCounter';

/**
 * The homepage: hero, then the generator, in one scroll.
 *
 * Sole owner of the frames counter. The hero displays it and the generator
 * increments it, and they must read the same number — two `useCounter()` calls
 * would desync the instant a download fired `bump()`.
 *
 * Scroll-derived state (the sticky header's visibility, the cue, parallax)
 * deliberately does NOT live here: re-rendering this component would re-render
 * the whole generator and its canvas effects on every scroll tick. The header
 * owns its own state; parallax and the cue write to refs and CSS custom
 * properties without touching React at all.
 */
export default function HomeShell() {
  const { count, bump } = useCounter();
  const heroRef = useRef(null);

  return (
    <MotionProvider>
      {/* Fixed, viewport-wide, z-index -1. Kept above the sections rather than
          inside one, so no ancestor transform can become its containing block
          and turn it into a scrolling, clipped layer. */}
      <BackdropDoodles />

      <main>
        <Hero ref={heroRef} count={count} />
        <GeneratorTool as="section" id="generator" brandTag="h2" count={count} onBump={bump} />
      </main>

      <StickyHeader heroRef={heroRef} />
    </MotionProvider>
  );
}
