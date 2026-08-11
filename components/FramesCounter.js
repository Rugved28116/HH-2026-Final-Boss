'use client';

import SignpostRibbon from './SignpostRibbon';

/**
 * Renders nothing at all until a count is known.
 * Shows the live frames counter inside an authentic signpost ribbon.
 */
export default function FramesCounter({ count }) {
  if (count === null || count === undefined) return null;
  return (
    <SignpostRibbon>
      ⚡ {count.toLocaleString()} FRAMES CREATED
    </SignpostRibbon>
  );
}
