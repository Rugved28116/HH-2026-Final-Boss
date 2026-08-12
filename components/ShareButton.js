'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { canvasToPngBlob, downloadCanvas, FILENAMES } from '@/lib/export/download';
import styles from './ShareButton.module.css';

const CONFIRM_MS = 3000;

/**
 * Caption per format. Every one carries #FrameInGoa — the tag is the point of
 * the share, so it is never left to the user to remember.
 */
const CAPTIONS = {
  pfp: 'Just pulled my HH Goa 2026 frame 🌅⚡ #FrameInGoa',
  card: 'Got my HH Goa 2026 builder pass 🌴🛠️ #FrameInGoa',
  team: 'Squad assembled for HH Goa 2026 🌴👥 #FrameInGoa',
};

/** The exact text the intent composer will be pre-filled with. */
export function captionFor(format) {
  return CAPTIONS[format] || CAPTIONS.pfp;
}

export function tweetIntentUrl(format, shareUrl) {
  const text = captionFor(format);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(shareUrl)}`;
}

/**
 * Share to X (app-flow.md §6).
 *
 * Exports the active canvas, uploads it for a public URL, then sends the user
 * to X's intent composer with the /s/[slug] link. That page carries the
 * og:image tags, which is what puts the graphic in the tweet's link preview
 * instead of posting a bare text tweet.
 *
 * Never a dead end: any upload failure falls back to a plain download.
 */
export default function ShareButton({
  getCanvas,
  format = 'pfp',
  disabled = false,
  className = '',
  label = 'SHARE TO X',
  filename = FILENAMES.card,
  onShared,
}) {
  const [state, setState] = useState('idle'); // idle | uploading | done | fallback | error
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas) return;

    clearTimeout(timer.current);
    setState('uploading');

    // Opened synchronously, inside the click handler, so the browser still
    // attributes it to the user gesture. Opening it after `await` is what gets
    // the tab swallowed by popup blockers — by then the gesture has expired.
    //
    // `noopener` deliberately omitted: with it, window.open returns null and
    // there is no handle left to navigate once the upload finishes. The
    // back-reference is severed manually below instead.
    const tab = window.open('about:blank', '_blank');

    try {
      const blob = await canvasToPngBlob(canvas);
      const formData = new FormData();
      formData.append('file', blob, filename);

      const res = await fetch('/api/share', { method: 'POST', body: formData });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(
          `POST /api/share failed: ${res.status}${detail.error ? ` (${detail.error})` : ''}`
        );
      }

      const data = await res.json();
      if (!data.shareUrl) throw new Error('POST /api/share returned no shareUrl');

      const intentUrl = tweetIntentUrl(format, data.shareUrl);

      if (tab) {
        tab.opener = null;
        // replace() keeps about:blank out of the new tab's history, so Back
        // doesn't strand the user on a blank page.
        tab.location.replace(intentUrl);
      } else {
        // Blocked despite the synchronous open. A direct call is the last
        // chance to honour the click.
        window.open(intentUrl, '_blank', 'noopener,noreferrer');
      }

      setState('done');
      onShared?.();
    } catch (err) {
      // Surfaced, not swallowed — this is the only signal that a share silently
      // degraded to a download.
      console.error('[ShareButton] upload failed, falling back to download:', err);
      // A blank tab left open reads as a broken share.
      tab?.close();

      try {
        await downloadCanvas(canvas, filename);
        setState('fallback');
        onShared?.();
      } catch (downloadErr) {
        console.error('[ShareButton] download fallback also failed:', downloadErr);
        setState('error');
      }
    }

    timer.current = setTimeout(() => setState('idle'), CONFIRM_MS);
  }, [getCanvas, filename, format, onShared]);

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
        {state === 'uploading' && <span className={styles.pending}>Uploading your graphic…</span>}
        {state === 'fallback' && (
          <span className={styles.fallback}>Share unavailable — downloaded file ✓</span>
        )}
        {state === 'error' && (
          <span className={styles.fallback}>Couldn’t share or download — see console</span>
        )}
      </span>
    </span>
  );
}
