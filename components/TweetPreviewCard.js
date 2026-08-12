'use client';

import styles from './TweetPreviewCard.module.css';

/**
 * Live X (Twitter) Tweet Preview Card Component (Feature 5).
 * Gives users instant visual confidence that the tweet link preview (og:image)
 * will render crisp and correctly formatted on the X timeline.
 */
export default function TweetPreviewCard({ name, role, getCanvas, onShare }) {
  const displayName = name.trim() || 'Jane Doe';
  const displayRole = role.trim() ? `• ${role.trim()}` : '';

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
          Heading to Goa for Beach × Bytes! Created my official HH Goa 2026 builder card. See you at the beach 🌊💻{' '}
          <span className={styles.hashtag}>#FrameInGoa</span> <span className={styles.mention}>@HackerHouseGoa</span>
        </p>

        {/* Embedded Link Preview Card */}
        <div className={styles.mediaCard}>
          <div className={styles.mediaHeader}>
            <span className={styles.mediaTitle}>HH Goa 2026 — Builder Card</span>
            <span className={styles.mediaDomain}>hhgoa.com</span>
          </div>
          <p className={styles.mediaDesc}>
            Check out my official HH Goa 2026 Builder Card! Generated instantly without accounts or waiting.
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
