'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { canvasToPngBlob, downloadCanvas, FILENAMES } from '@/lib/export/download';
import styles from './ShareButton.module.css';

const CONFIRM_MS = 3000;

/**
 * Share to X action button (app-flow.md §6).
 * Client-side component that exports canvas to PNG blob, opens X tweet intent,
 * and falls back gracefully to a direct download if network/share fails.
 */
export default function ShareButton({
  getCanvas,
  disabled = false,
  className = '',
  label = 'SHARE TO X',
  filename = FILENAMES.card,
  onShared,
}) {
  const [state, setState] = useState('idle'); // idle | uploading | done | fallback
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas) return;

    clearTimeout(timer.current);
    setState('uploading');

    try {
      const blob = await canvasToPngBlob(canvas);
      const formData = new FormData();
      formData.append('file', blob, filename);

      const res = await fetch('/api/share', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);

      const data = await res.json();
      if (!data.shareUrl) throw new Error('No share URL returned');

      const tweetText = encodeURIComponent(
        'Check out my HH Goa 2026 graphic! Created for @HackerHouseGoa 🌊💻 #FrameInGoa\n'
      );
      const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(
        data.shareUrl
      )}`;

      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      setState('done');
      onShared?.();
    } catch (err) {
      console.warn('Share upload failed, falling back to download:', err);
      try {
        await downloadCanvas(canvas, filename);
        setState('fallback');
        onShared?.();
      } catch {
        setState('idle');
      }
    }

    timer.current = setTimeout(() => setState('idle'), CONFIRM_MS);
  }, [getCanvas, filename, onShared]);

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={`${className} ${styles.button} ${state === 'done' ? styles.doneBtn : ''}`}
        onClick={onClick}
        disabled={disabled || state === 'uploading'}
      >
        {state === 'uploading' ? 'UPLOADING…' : state === 'done' ? 'OPENED X ↗' : label}
      </button>

      <span className={styles.status} role="status" aria-live="polite">
        {state === 'fallback' && (
          <span className={styles.fallback}>Share unavailable — downloaded file ✓</span>
        )}
      </span>
    </span>
  );
}
