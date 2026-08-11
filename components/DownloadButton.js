'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadCanvas } from '@/lib/export/download';
import styles from './DownloadButton.module.css';

const CONFIRM_MS = 2400;

/**
 * Wraps the canvas → PNG export with its own inline confirmation, so both
 * formats get identical behaviour without duplicating the timer bookkeeping.
 *
 * @param {() => HTMLCanvasElement|null} getCanvas resolved at click time, not
 *   render time — the canvas is repainted constantly and we want whatever is
 *   on screen at the moment the user commits.
 */
export default function DownloadButton({
  getCanvas,
  filename,
  disabled = false,
  className = '',
  label = 'DOWNLOAD',
  onDownloaded,
}) {
  const [state, setState] = useState('idle'); // idle | working | done | error
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    clearTimeout(timer.current);
    setState('working');
    try {
      await downloadCanvas(canvas, filename);
      setState('done');
      // Fire-and-forget, and only on success. Never awaited — the counter must
      // not be able to delay or fail the download itself.
      onDownloaded?.();
    } catch {
      setState('error');
    }
    timer.current = setTimeout(() => setState('idle'), CONFIRM_MS);
  }, [getCanvas, filename, onDownloaded]);

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={`${className} ${styles.button}`}
        onClick={onClick}
        disabled={disabled || state === 'working'}
      >
        {label}
      </button>
      {/* Reserved inline slot rather than an inserted node — announcing the
          confirmation must not shift the buttons around it. */}
      <span className={styles.status} role="status" aria-live="polite">
        {state === 'done' && <span className={styles.done}>Downloaded ✓</span>}
        {state === 'error' && (
          <span className={styles.error}>Couldn&apos;t save that file.</span>
        )}
      </span>
    </span>
  );
}
