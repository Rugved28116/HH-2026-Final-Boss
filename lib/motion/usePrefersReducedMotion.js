'use client';

import { useEffect, useState } from 'react';

/**
 * Live `prefers-reduced-motion` state.
 *
 * Deliberately not framer's own `useReducedMotion()`: that one snapshots the
 * value once at mount and never re-renders when the setting changes (its
 * source carries a TODO saying as much), and it returns `null` during SSR,
 * which risks a hydration mismatch if consumed in render. This repo's
 * convention — established in BackdropDoodles — is a live `change` listener.
 *
 * The lazy initialiser means the value is already correct on the hydration
 * render rather than flipping on the first effect pass.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return reduced;
}
