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

/** The exact text the share composer will be pre-filled with. */
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
 * Whether this browser can hand a PNG File to the native share sheet
 * (Web Share Level 2 — in practice: mobile, plus macOS Safari).
 *
 * Probed with an empty stand-in File: canShare validates type support, not
 * content, so the check is synchronous and free. It must be synchronous,
 * because the two paths diverge before the first await — the intent path has
 * to open its tab inside the click gesture, while the share-sheet path must
 * not open a tab at all.
 */
function canShareFile(filename) {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false;
  }
  try {
    return navigator.canShare({
      files: [new File([new Blob()], filename, { type: 'image/png' })],
    });
  } catch {
    return false;
  }
}

/**
 * Share to X (app-flow.md §6). Two tiers:
 *
 * 1. Web Share with a File, where supported — the native sheet, and if the
 *    user picks the X app the PNG is attached to the post as a real photo.
 * 2. Otherwise (desktop): upload to blob → /s/[slug] OG page → tweet intent.
 *    Desktop browsers cannot attach a file to an intent URL at all, so a rich
 *    link preview is the closest thing to "attached" that exists there.
 *
 * The two never chain: a dismissed or failed share sheet does not then open
 * an intent tab — one click means at most one share surface.
 *
 * Never a dead end: real failures on either path fall back to a download.
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
  // idle | sharing (native sheet) | uploading (intent path) | shared | done | fallback | error
  const [state, setState] = useState('idle');
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const fallBackToDownload = useCallback(
    async (canvas) => {
      try {
        await downloadCanvas(canvas, filename);
        setState('fallback');
        onShared?.();
      } catch (downloadErr) {
        console.error('[ShareButton] download fallback also failed:', downloadErr);
        setState('error');
      }
    },
    [filename, onShared]
  );

  const onClick = useCallback(async () => {
    // getCanvas flushes any pending render first (see flushRender in the
    // preview page), so the export is the exact bitmap on screen — never one
    // keystroke behind. toBlob then reads the full-resolution bitmap, not the
    // CSS-scaled display size.
    const canvas = getCanvas();
    if (!canvas) return;

    clearTimeout(timer.current);

    /* Tier 1 — native share sheet with the PNG as a real file. */
    if (canShareFile(filename)) {
      setState('sharing');
      try {
        const blob = await canvasToPngBlob(canvas);
        const file = new File([blob], filename, { type: 'image/png' });
        await navigator.share({ files: [file], text: captionFor(format) });
        setState('shared');
        onShared?.();
      } catch (err) {
        if (err?.name === 'AbortError') {
          // The user closed the sheet. Their decision, not a failure — reset
          // silently, and do not counter it with a download or an intent tab.
          setState('idle');
          return;
        }
        console.error('[ShareButton] Web Share failed, falling back to download:', err);
        await fallBackToDownload(canvas);
      }
      timer.current = setTimeout(() => setState('idle'), CONFIRM_MS);
      // Whatever happened above, the intent path must not also run.
      return;
    }

    /* Tier 2 — upload → OG landing page → tweet intent. */
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
      await fallBackToDownload(canvas);
    }

    timer.current = setTimeout(() => setState('idle'), CONFIRM_MS);
  }, [getCanvas, filename, format, onShared, fallBackToDownload]);

  const busy = state === 'sharing' || state === 'uploading';
  const succeeded = state === 'shared' || state === 'done';

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={`${className} ${styles.button} ${succeeded ? styles.doneBtn : ''}`}
        onClick={onClick}
        disabled={disabled || busy}
      >
        {state === 'sharing'
          ? 'OPENING SHARE…'
          : state === 'uploading'
            ? 'UPLOADING…'
            : state === 'shared'
              ? 'SHARED ✓'
              : state === 'done'
                ? 'OPENED X ↗'
                : label}
      </button>

      <span className={styles.status} role="status" aria-live="polite">
        {state === 'uploading' && <span className={styles.pending}>Uploading your graphic…</span>}
        {/* Honest about what the intent path can deliver: the graphic rides
            along as a link preview, not as an attached photo. */}
        {state === 'done' && (
          <span className={styles.pending}>Opened X — your graphic will show as a preview</span>
        )}
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
