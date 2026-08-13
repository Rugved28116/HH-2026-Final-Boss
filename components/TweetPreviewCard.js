'use client';

import { captionFor } from './ShareButton';
import styles from './TweetPreviewCard.module.css';

// The domain X shows under the link card. Derived from the same env var the
// share route builds shareUrl from, so this mock can't contradict the real
// tweet; the fallback matches QR_TARGET_URL's (lib/render/qr.js).
// NEXT_PUBLIC_* is inlined at build time, so this is safe in a client file.
function shareDomain() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hhgoa2026.vercel.app/').host;
  } catch {
    return 'hhgoa2026.vercel.app';
  }
}

/**
 * Live X (Twitter) Tweet Preview Card Component (Feature 5).
 * Gives users instant visual confidence that the tweet link preview (og:image)
 * will render crisp and correctly formatted on the X timeline.
 *
 * The body text comes from the same CAPTIONS map the Share button posts with,
 * so this preview can't drift out of sync with the real tweet.
 */
export default function TweetPreviewCard({ name, role, format = 'card' }) {
  const displayName = name.trim() || 'Puneet Superstar';
  const displayRole = role.trim() ? `• ${role.trim()}` : '';
  const caption = captionFor(format);
  // The tag is rendered as its own styled span, so strip it from the run.
  const captionBody = caption.replace('#FrameInGoa', '').trim();

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>LIVE TWEET PREVIEW ON X</span>
        <span className={styles.liveTag}>LIVE PREVIEW</span>
      </div>

      <div className={styles.tweetCard}>
        {/* Tweet Author Row */}
        <div className={styles.authorRow}>
          <div className={styles.avatar}>
            <span>🌴</span>
          </div>
          <div className={styles.authorMeta}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{displayName}</span>
              <span className={styles.badge}>✓</span>
              <span className={styles.handle}>@builder</span>
              <span className={styles.dot}>·</span>
              <span className={styles.time}>now</span>
            </div>
            <span className={styles.subMeta}>Attending Hacker House Goa 2026 {displayRole}</span>
          </div>
        </div>

        {/* Tweet Text */}
        <p className={styles.tweetText}>
          {captionBody}{' '}
          <span className={styles.hashtag}>#FrameInGoa</span>
        </p>

        {/* Embedded Link Preview Card — mirrors the real OG tags served by
            /s/[slug], so what the user sees here is what X will render. */}
        <div className={styles.mediaCard}>
          <div className={styles.mediaHeader}>
            <span className={styles.mediaTitle}>HH Goa 2026 — Beach × Bytes</span>
            <span className={styles.mediaDomain}>{shareDomain()}</span>
          </div>
          <p className={styles.mediaDesc}>
            Made with the HH Goa 2026 frame generator. Make your own in seconds.
          </p>
        </div>

        {/* Tweet Actions Row */}
        <div className={styles.tweetActions}>
          <span className={styles.actionItem}>💬 12</span>
          <span className={styles.actionItem}>🔁 48</span>
          <span className={styles.actionItem}>❤️ 192</span>
          <span className={styles.actionItem}>📊 2.4k</span>
        </div>
      </div>
    </div>
  );
}
