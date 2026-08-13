// Shared framer-motion variants for the hero entrance.
//
// design.md §10 puts a ceiling on how long anything may take to settle, so the
// whole sequence is budgeted: last child starts at ~0.56s and settles by ~0.9s.

export const SPRING = { type: 'spring', stiffness: 320, damping: 24, mass: 0.9 };

/** Stagger parent. Animates nothing itself — it only sequences its children. */
export const container = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.12 } },
};

/**
 * The headline is both a child of `container` and a parent of its words.
 * framer propagates the "visible" label down through any node that declares
 * `variants` without its own `animate`, so the per-word stagger needs no
 * manual delay bookkeeping.
 */
export const wordGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

/**
 * Reduced-motion twins.
 *
 * `hidden` MUST stay byte-identical to the variants above: framer serialises
 * the `hidden` variant into inline style during SSR, and a `hidden` that
 * differed between the two would produce a React hydration mismatch on every
 * reduced-motion visitor. Only the `visible` transition may differ.
 *
 * (MotionConfig reducedMotion="user" already forces the *transforms* instant;
 * these exist to collapse the stagger *timing* as well, so content appears at
 * once rather than dribbling in over a second with no movement.)
 */
export const containerInstant = {
  hidden: {},
  visible: { transition: { delayChildren: 0, staggerChildren: 0 } },
};

export const wordGroupInstant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
};

export const itemInstant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};
