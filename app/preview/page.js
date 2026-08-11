'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BackdropDoodles from '@/components/BackdropDoodles';
import CardFields from '@/components/CardFields';
import DownloadButton from '@/components/DownloadButton';
import FormatTabs from '@/components/FormatTabs';
import FlippableBadge from '@/components/FlippableBadge';
import PhotoNudgeControls from '@/components/PhotoNudgeControls';
import RevealCanvas from '@/components/RevealCanvas';
import ShareButton from '@/components/ShareButton';
import UploadZone from '@/components/UploadZone';
import { useCounter } from '@/lib/counter/useCounter';
import { FILENAMES } from '@/lib/export/download';
import { flickerCandidates, poolFor, rollTitle } from '@/lib/title/pools';
import { resolveCanvasFonts } from '@/lib/render/canvasFonts';
import { getQrCanvas } from '@/lib/render/qr';
import { PFP_SIZE, drawPfpFrame } from '@/lib/render/pfp';
import { CARD_W, CARD_H, CARD_QR_SIZE } from '@/lib/render/card';
import { createCardPainter } from '@/lib/render/cardPainter';
import styles from './preview.module.css';

const EMPTY_TITLE = { text: '', tier: 'common', pool: null };

const FLICKER_STEPS = [0, 90, 200];
const FLICKER_LAND = 340;
const SHEEN_MS = 620;

export default function PreviewPage() {
  const pfpRef = useRef(null);
  const cardRef = useRef(null);
  const fontsRef = useRef(null);
  const qrRef = useRef(null);

  const { count, bump } = useCounter();
  const [format, setFormat] = useState('pfp');
  const [zoom, setZoom] = useState('fit');
  const [photo, setPhoto] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [title, setTitle] = useState(EMPTY_TITLE);
  const [displayTitle, setDisplayTitle] = useState('');
  const [shuffling, setShuffling] = useState(false);
  const [revealToken, setRevealToken] = useState(0);

  // Feature 1: Selected Sticker Pack
  const [selectedStickers, setSelectedStickers] = useState([
    'shield',
    'scallop',
    'octagon',
    'airmail',
    'stamp',
  ]);

  // Feature 2: Photo Pan/Zoom Transform
  const [photoTransform, setPhotoTransform] = useState({ panX: 0, panY: 0, zoom: 1 });

  const revealedFor = useRef(null);
  const pendingReveal = useRef(false);

  const drawParams = useRef({
    photo: null,
    name: '',
    role: '',
    title: EMPTY_TITLE,
    sheen: null,
    format: 'pfp',
    photoTransform: { panX: 0, panY: 0, zoom: 1 },
    selectedStickers: ['shield', 'scallop', 'octagon', 'airmail', 'stamp'],
  });
  const paintRaf = useRef(0);
  const sheenRaf = useRef(0);
  const timers = useRef([]);
  const poolRef = useRef(null);
  const reducedMotion = useRef(false);
  const cardPainter = useRef(null);

  const paint = useCallback(() => {
    paintRaf.current = 0;
    const fonts = fontsRef.current;
    if (!fonts) return;
    const p = drawParams.current;

    if (p.format === 'pfp' && pfpRef.current) {
      drawPfpFrame(pfpRef.current.getContext('2d'), {
        fonts,
        photo: p.photo,
        photoTransform: p.photoTransform,
      });
    }
    if (p.format === 'card' && cardRef.current) {
      if (!cardPainter.current) cardPainter.current = createCardPainter();
      cardPainter.current(cardRef.current.getContext('2d'), {
        fonts,
        photo: p.photo,
        sheen: p.sheen,
        qr: qrRef.current,
        photoTransform: p.photoTransform,
        selectedStickers: p.selectedStickers,
        fields: {
          name: p.name.trim() || 'Your Name',
          role: p.role.trim() || 'Your Role',
          builderTitle: p.title.text ? p.title : { text: 'roll a title', tier: 'common' },
        },
      });
    }

    if (pendingReveal.current) {
      pendingReveal.current = false;
      setRevealToken((n) => n + 1);
    }
  }, []);

  const schedulePaint = useCallback(() => {
    if (paintRaf.current) return;
    paintRaf.current = requestAnimationFrame(paint);
  }, [paint]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reducedMotion.current = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('zoom') === 'full') setZoom('full');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [fonts, qr] = await Promise.all([
        resolveCanvasFonts(),
        getQrCanvas(CARD_QR_SIZE),
      ]);
      if (cancelled) return;
      fontsRef.current = fonts;
      qrRef.current = qr;
      schedulePaint();
    })();
    return () => {
      cancelled = true;
    };
  }, [schedulePaint]);

  useEffect(() => {
    if (photo && photo !== revealedFor.current) {
      revealedFor.current = photo;
      pendingReveal.current = true;
    }
    if (!photo) revealedFor.current = null;

    drawParams.current.photo = photo?.image ?? null;
    drawParams.current.name = name;
    drawParams.current.role = role;
    drawParams.current.format = format;
    drawParams.current.photoTransform = photoTransform;
    drawParams.current.selectedStickers = selectedStickers;
    drawParams.current.title = shuffling
      ? { text: displayTitle, tier: 'common' }
      : { ...title, text: displayTitle };
    schedulePaint();
  }, [
    photo,
    name,
    role,
    title,
    displayTitle,
    shuffling,
    format,
    photoTransform,
    selectedStickers,
    schedulePaint,
  ]);

  useEffect(
    () => () => {
      cancelAnimationFrame(paintRaf.current);
      paintRaf.current = 0;
      cancelAnimationFrame(sheenRaf.current);
      sheenRaf.current = 0;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    []
  );

  const runSheen = useCallback(() => {
    cancelAnimationFrame(sheenRaf.current);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / SHEEN_MS);
      drawParams.current.sheen = t;
      schedulePaint();
      if (t < 1) {
        sheenRaf.current = requestAnimationFrame(step);
      } else {
        drawParams.current.sheen = null;
        schedulePaint();
      }
    };
    sheenRaf.current = requestAnimationFrame(step);
  }, [schedulePaint]);

  const land = useCallback(
    (next) => {
      setTitle(next);
      setDisplayTitle(next.text);
      setShuffling(false);
      poolRef.current = next.pool;
      if (next.tier === 'rare' && !reducedMotion.current) runSheen();
    },
    [runSheen]
  );

  useEffect(() => {
    const trimmed = role.trim();
    if (!trimmed) {
      poolRef.current = null;
      setTitle(EMPTY_TITLE);
      setDisplayTitle('');
      return;
    }
    const pool = poolFor(trimmed);
    if (pool !== poolRef.current) land(rollTitle(trimmed));
  }, [role, land]);

  const shuffle = useCallback(() => {
    const trimmed = role.trim();
    if (!trimmed) return;

    timers.current.forEach(clearTimeout);
    timers.current = [];

    const next = rollTitle(trimmed, { avoid: title.text });
    if (reducedMotion.current) {
      land(next);
      return;
    }

    const candidates = flickerCandidates(trimmed, FLICKER_STEPS.length, {
      from: title.text,
      to: next.text,
    });
    setShuffling(true);
    FLICKER_STEPS.forEach((delay, i) => {
      timers.current.push(setTimeout(() => setDisplayTitle(candidates[i]), delay));
    });
    timers.current.push(setTimeout(() => land(next), FLICKER_LAND));
  }, [role, title.text, land]);

  const onPhoto = useCallback((next, name) => {
    setPhoto(next);
    setFileName(name);
    setPhotoTransform({ panX: 0, panY: 0, zoom: 1 });
  }, []);

  const canvasClass = zoom === 'fit' ? styles.canvasFit : styles.canvasFull;
  const ready = Boolean(name.trim() && role.trim());

  return (
    <main className={styles.wrap}>
      <BackdropDoodles />

      <header className={styles.topRow}>
        <div className={styles.brandLockup}>
          <h1 className={styles.brandTitle}>HACKER HOUSE GOA</h1>
          <span className={styles.scriptAccent}>गोवा</span>
          <span className={styles.terminalChip}>&gt; {format}.goa[2026]</span>
        </div>
        <p className={styles.eyebrow}>BEACH × BYTES</p>
      </header>

      <FormatTabs value={format} onChange={setFormat} />

      <UploadZone onPhoto={onPhoto} fileName={fileName} />

      {/* Feature 2: Photo Pan/Zoom Nudge Controls */}
      {photo && (
        <PhotoNudgeControls transform={photoTransform} onChange={setPhotoTransform} />
      )}

      {format === 'card' && (
        <CardFields
          name={name}
          role={role}
          title={title}
          displayTitle={displayTitle}
          shuffling={shuffling}
          onNameChange={setName}
          onRoleChange={setRole}
          onShuffle={shuffle}
          ready={ready}
          getCardCanvas={() => cardRef.current}
          onDownloaded={bump}
          selectedStickers={selectedStickers}
          onStickersChange={setSelectedStickers}
        />
      )}

      <div className={styles.controls}>
        <span className={styles.controlLabel}>PREVIEW SCALE:</span>
        <button
          type="button"
          className={zoom === 'fit' ? styles.btnActive : styles.btn}
          onClick={() => setZoom('fit')}
        >
          FIT VIEW
        </button>
        <button
          type="button"
          className={zoom === 'full' ? styles.btnActive : styles.btn}
          onClick={() => setZoom('full')}
        >
          100% SCALE
        </button>
      </div>

      <div className={styles.row}>
        <FlippableBadge
          isFlipped={format === 'pfp'}
          onFlipToggle={() => setFormat(format === 'card' ? 'pfp' : 'card')}
          frontContent={
            <figure className={styles.fig}>
              <div className={styles.figHeader}>
                <figcaption className={styles.cap}>1080×1512 · BUILDER ID CARD</figcaption>
                <span className={styles.liveBadge}>CANVAS READY</span>
              </div>

              <RevealCanvas
                canvasRef={cardRef}
                width={CARD_W}
                height={CARD_H}
                className={canvasClass}
                ariaLabel="Builder ID card preview"
                revealToken={revealToken}
              />
            </figure>
          }
          backContent={
            <figure className={styles.fig}>
              <div className={styles.figHeader}>
                <figcaption className={styles.cap}>1080×1080 · PFP FRAME</figcaption>
                <span className={styles.liveBadge}>CANVAS READY</span>
              </div>

              <RevealCanvas
                canvasRef={pfpRef}
                width={PFP_SIZE}
                height={PFP_SIZE}
                className={canvasClass}
                ariaLabel="PFP frame preview"
                revealToken={revealToken}
              />

              <div className={styles.pfpActions}>
                <DownloadButton
                  getCanvas={() => pfpRef.current}
                  filename={FILENAMES.pfp}
                  label="DOWNLOAD"
                  onDownloaded={bump}
                />
                <ShareButton
                  getCanvas={() => pfpRef.current}
                  filename={FILENAMES.pfp}
                  onShared={bump}
                />
              </div>
            </figure>
          }
        />
      </div>
    </main>
  );
}
