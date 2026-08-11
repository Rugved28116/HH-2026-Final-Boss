'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { loadPhoto, photoErrorMessage } from '@/lib/photo/loadPhoto';
import styles from './UploadZone.module.css';

export default function UploadZone({ onPhoto, fileName }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // dragenter/dragleave also fire when the cursor crosses child elements, so
  // depth-count them — otherwise the highlight flickers off mid-hover.
  const dragDepth = useRef(0);

  const accept = useCallback(
    async (file) => {
      setError(null);
      setBusy(true);
      try {
        const photo = await loadPhoto(file);
        onPhoto(photo, file.name);
      } catch (err) {
        // The zone stays mounted and interactive — the error is inline state,
        // never a replacement for the control (app-flow.md §2).
        setError(photoErrorMessage(err));
        onPhoto(null, null);
      } finally {
        setBusy(false);
      }
    },
    [onPhoto]
  );

  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }, []);

  const onDragOver = useCallback((e) => {
    // Required, or the browser navigates to the file instead of firing drop.
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) accept(file);
    },
    [accept]
  );

  const onChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) accept(file);
      // Reset so re-picking the same file still fires a change event.
      e.target.value = '';
    },
    [accept]
  );

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  return (
    <div className={styles.wrap}>
      <label
        htmlFor={inputId}
        className={`${styles.zone} ${dragging ? styles.zoneDragging : ''}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="button"
        aria-busy={busy}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className={styles.input}
          accept="image/*,.heic,.heif"
          onChange={onChange}
        />
        <span className={styles.title}>
          {busy ? 'READING PHOTO…' : dragging ? 'DROP IT' : 'DROP A PHOTO'}
        </span>
        <span className={styles.hint}>
          {fileName && !busy && !dragging ? fileName : 'or tap to browse · JPG, PNG, WEBP, HEIC'}
        </span>
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
