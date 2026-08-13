'use client';

import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';

/**
 * Wraps everything that animates.
 *
 * `LazyMotion` + the `m` component + a *static* `domAnimation` import loads
 * ~20KB gz instead of the ~39KB the full `motion` bundle costs. The import is
 * static rather than a `() => import(...)` on purpose: an async feature fetch
 * would delay the hero's entrance by a round trip. `domAnimation` carries the
 * `inView` feature, so `whileInView` works under it.
 *
 * `strict` makes `motion.div` throw — everything must use `m.div`, which is
 * what keeps the tree-shaken bundle honest.
 *
 * `reducedMotion="user"` is the important one. framer defaults to `"never"`
 * and ignores the OS setting entirely unless told otherwise. With `"user"`,
 * every transform becomes instant while opacity still animates — which is
 * exactly this repo's house rule for reduced motion (kill the movement, keep
 * the change discoverable). It applies to every `m.*` in the tree, so
 * individual components don't each re-implement it.
 */
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
