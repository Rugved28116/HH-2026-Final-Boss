'use client';

import styles from './StickerPackPicker.module.css';

export const ALL_STICKERS = [
  { id: 'shield', label: 'HOTEL SHIELD', icon: '🏨' },
  { id: 'scallop', label: 'PORT STEAMSHIP', icon: '⛵' },
  { id: 'octagon', label: 'CALANGUTE RESORT', icon: '🏖️' },
  { id: 'airmail', label: 'AIR MAIL BANNER', icon: '✈️' },
  { id: 'stamp', label: 'CUSTOMS STAMP', icon: '📮' },
];

/**
 * Sticker Pack Customizer Component (Feature 1).
 * Allows 1-tap toggling of vintage travel stickers on the Builder ID Card.
 */
export default function StickerPackPicker({ selectedStickers, onChange }) {
  const activeSet = new Set(selectedStickers ?? ALL_STICKERS.map((s) => s.id));

  const toggle = (id) => {
    const next = new Set(activeSet);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id); // Keep at least 1 sticker
    } else {
      next.add(id);
    }
    onChange(Array.from(next));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>04 // VINTAGE STICKER PACK</span>
        <span className={styles.hint}>TAP TO TOGGLE LABELS</span>
      </div>

      <div className={styles.pills}>
        {ALL_STICKERS.map((sticker) => {
          const active = activeSet.has(sticker.id);
          return (
            <button
              key={sticker.id}
              type="button"
              className={`${styles.pill} ${active ? styles.pillActive : ''}`}
              onClick={() => toggle(sticker.id)}
            >
              <span className={styles.icon}>{sticker.icon}</span>
              <span className={styles.label}>{sticker.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
