'use client';

import styles from './FormatTabs.module.css';

export const FORMATS = [
  { id: 'pfp', label: 'PFP FRAME', icon: '🖼️', tag: '1080×1080' },
  { id: 'card', label: 'BUILDER ID', icon: '🪪', tag: '1080×1512' },
  { id: 'team', label: 'TEAM SQUAD', icon: '👥', tag: '1200×630' },
];

/**
 * Pill switcher, active state filled yellow with ink text (design.md §7).
 *
 * Spring-eased sliding pill indicator with cream outline and die-cut offset shadow.
 */
export default function FormatTabs({ value, onChange }) {
  const index = Math.max(0, FORMATS.findIndex((f) => f.id === value));

  return (
    <div className={styles.wrap}>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Output format"
        // Drives the indicator's width in CSS, so adding a format here can't
        // leave the sliding pill sized for the old tab count.
        style={{ '--tab-count': FORMATS.length }}
      >
        <span
          className={styles.indicator}
          style={{ transform: `translateX(${index * 100}%)` }}
          aria-hidden="true"
        />
        {FORMATS.map((format) => (
          <button
            key={format.id}
            type="button"
            role="tab"
            aria-selected={value === format.id}
            className={`${styles.tab} ${value === format.id ? styles.tabActive : ''}`}
            onClick={() => onChange(format.id)}
          >
            <span className={styles.icon}>{format.icon}</span>
            <span className={styles.labelText}>{format.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
