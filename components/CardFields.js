'use client';

import DownloadButton from './DownloadButton';
import ShareButton from './ShareButton';
import StickerPackPicker from './StickerPackPicker';
import TweetPreviewCard from './TweetPreviewCard';
import { FILENAMES } from '@/lib/export/download';
import styles from './CardFields.module.css';

export const NAME_MAX = 28;
export const ROLE_MAX = 24;

export default function CardFields({
  name,
  role,
  title,
  displayTitle,
  shuffling,
  onNameChange,
  onRoleChange,
  onShuffle,
  ready,
  getCardCanvas,
  onDownloaded,
  selectedStickers,
  onStickersChange,
}) {
  const isRare = title?.tier === 'rare' && !shuffling;

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>01 // YOUR NAME</span>
          <input
            className={styles.input}
            type="text"
            value={name}
            maxLength={NAME_MAX}
            placeholder="Jane Doe"
            autoComplete="name"
            onChange={(e) => onNameChange(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>02 // STACK / ROLE</span>
          <input
            className={styles.input}
            type="text"
            value={role}
            maxLength={ROLE_MAX}
            placeholder="Full-Stack"
            onChange={(e) => onRoleChange(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label}>03 // BUILDER TITLE</span>
          {isRare && <span className={styles.rareBadge}>✨ RARE UNLOCKED</span>}
        </div>

        <div className={styles.titleRow}>
          <output
            className={`${styles.title} ${isRare ? styles.titleRare : ''}`}
            aria-live={shuffling ? 'off' : 'polite'}
          >
            <span className={styles.promptPrefix}>&gt;</span>
            <span className={styles.titleText}>
              {displayTitle || <span className={styles.titleEmpty}>type a role to generate</span>}
            </span>
          </output>
          <button
            type="button"
            className={styles.shuffle}
            onClick={onShuffle}
            disabled={!role.trim()}
            aria-label="Shuffle builder title"
            title="Shuffle builder title"
          >
            🎲
          </button>
        </div>
      </div>

      {/* Feature 1: Sticker Pack Customizer */}
      <StickerPackPicker selectedStickers={selectedStickers} onChange={onStickersChange} />

      <div className={styles.actions}>
        <DownloadButton
          getCanvas={getCardCanvas}
          filename={FILENAMES.card}
          disabled={!ready}
          className={styles.primary}
          onDownloaded={onDownloaded}
        />
        <ShareButton
          getCanvas={getCardCanvas}
          filename={FILENAMES.card}
          disabled={!ready}
          onShared={onDownloaded}
        />
      </div>
      {!ready && (
        <p className={styles.gateHint}>💡 Fill in Name and Stack/Role to enable card actions.</p>
      )}

      {/* Feature 5: Live X Tweet Timeline Preview Card */}
      {ready && (
        <TweetPreviewCard
          name={name}
          role={role}
          getCanvas={getCardCanvas}
          onShare={onDownloaded}
        />
      )}
    </div>
  );
}
