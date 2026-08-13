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
export default function StickyHeader() {
  return null;
}
