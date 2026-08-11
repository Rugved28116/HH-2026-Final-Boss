'use client';

import styles from './PhotoNudgeControls.module.css';

/**
 * Photo Pan/Zoom Nudge Controls (Feature 2).
 * Allows fine-tuning off-center selfies/group photos inside the circular frame.
 */
export default function PhotoNudgeControls({ transform, onChange }) {
  const panX = transform?.panX ?? 0;
  const panY = transform?.panY ?? 0;
  const zoom = transform?.zoom ?? 1;

  const move = (dx, dy) => {
    onChange({
      ...transform,
      panX: Math.max(-120, Math.min(120, panX + dx)),
      panY: Math.max(-120, Math.min(120, panY + dy)),
    });
  };

  const setZoomLevel = (newZoom) => {
    onChange({
      ...transform,
      zoom: Math.max(1, Math.min(2.5, Number(newZoom.toFixed(2)))),
    });
  };

  const reset = () => {
    onChange({ panX: 0, panY: 0, zoom: 1 });
  };

  const isCustomized = panX !== 0 || panY !== 0 || zoom !== 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>📸 PHOTO FRAME ADJUSTMENT</span>
        {isCustomized && (
          <button type="button" className={styles.resetBtn} onClick={reset}>
            RESET
          </button>
        )}
      </div>

      <div className={styles.row}>
        {/* Directional D-Pad */}
        <div className={styles.dpad}>
          <button
            type="button"
            className={`${styles.dpadBtn} ${styles.up}`}
            onClick={() => move(0, -15)}
            title="Pan Up"
            aria-label="Pan photo up"
          >
            ▲
          </button>
          <button
            type="button"
            className={`${styles.dpadBtn} ${styles.left}`}
            onClick={() => move(-15, 0)}
            title="Pan Left"
            aria-label="Pan photo left"
          >
            ◀
          </button>
          <button
            type="button"
            className={`${styles.dpadBtn} ${styles.right}`}
            onClick={() => move(15, 0)}
            title="Pan Right"
            aria-label="Pan photo right"
          >
            ▶
          </button>
          <button
            type="button"
            className={`${styles.dpadBtn} ${styles.down}`}
            onClick={() => move(0, 15)}
            title="Pan Down"
            aria-label="Pan photo down"
          >
            ▼
          </button>
        </div>

        {/* Zoom Slider & Buttons */}
        <div className={styles.zoomControl}>
          <div className={styles.zoomRow}>
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={() => setZoomLevel(zoom - 0.1)}
              disabled={zoom <= 1}
              title="Zoom out"
            >
              −
            </button>
            <input
              type="range"
              min="1"
              max="2.2"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Photo zoom level"
            />
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={() => setZoomLevel(zoom + 0.1)}
              disabled={zoom >= 2.2}
              title="Zoom in"
            >
              +
            </button>
          </div>
          <span className={styles.zoomReadout}>{Math.round(zoom * 100)}% SCALE</span>
        </div>
      </div>
    </div>
  );
}
