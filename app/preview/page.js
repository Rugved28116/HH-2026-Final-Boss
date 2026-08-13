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
import TeamFields from '@/components/TeamFields';
import UploadZone from '@/components/UploadZone';
import { useCounter } from '@/lib/counter/useCounter';
import { FILENAMES } from '@/lib/export/download';
import { flickerCandidates, poolFor, rollTitle } from '@/lib/title/pools';
import { flickerPassIds, rollPassId } from '@/lib/team/passId';
import { resolveCanvasFonts } from '@/lib/render/canvasFonts';
import { getQrCanvas } from '@/lib/render/qr';
import { PFP_SIZE, drawPfpFrame } from '@/lib/render/pfp';
import { CARD_W, CARD_H, CARD_QR_SIZE } from '@/lib/render/card';
import { TEAM_W, TEAM_H, TEAM_MAX_MEMBERS, drawTeamFrame } from '@/lib/render/team';
import { createCardPainter } from '@/lib/render/cardPainter';
import styles from './preview.module.css';

const EMPTY_TITLE = { text: '', tier: 'common', pool: null };
const EMPTY_MEMBER = { name: '', photo: null, fileName: null };

const FLICKER_STEPS = [0, 90, 200];
const FLICKER_LAND = 340;
const SHEEN_MS = 620;

export default function PreviewPage() {
  const pfpRef = useRef(null);
  const cardRef = useRef(null);
  const teamRef = useRef(null);
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

  // Format C — Team Squad. Slot 1 is always present and draws its photo from
  // the page-level `photo` state, so there is only ever one "your photo"
  // regardless of which format is active.
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([EMPTY_MEMBER]);
  const [builderClass, setBuilderClass] = useState(EMPTY_TITLE);
  const [displayClass, setDisplayClass] = useState('');
  const [classShuffling, setClassShuffling] = useState(false);
  // Generated on mount rather than in the initial state: rollPassId uses
  // crypto.getRandomValues, and a value produced during SSR would not match the
  // one the client generates on hydration.
  const [passId, setPassId] = useState('');
  const [displayPassId, setDisplayPassId] = useState('');
  const [passShuffling, setPassShuffling] = useState(false);

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
    teamName: '',
    teamMembers: [EMPTY_MEMBER],
    builderClass: EMPTY_TITLE,
    passId: '',
  });
  const paintRaf = useRef(0);
  const sheenRaf = useRef(0);
  const timers = useRef([]);
  const classTimers = useRef([]);
  const passTimers = useRef([]);
  const poolRef = useRef(null);
  const classPoolRef = useRef(null);
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

    if (p.format === 'team' && teamRef.current) {
      drawTeamFrame(teamRef.current.getContext('2d'), {
        fonts,
        teamName: p.teamName,
        members: p.teamMembers,
        builderClass: p.builderClass.text
          ? p.builderClass
          : { text: '', tier: 'common' },
        passId: p.passId,
        photoTransform: p.photoTransform,
        sheen: p.sheen,
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

  // Export-time freshness guarantee. Paints are deferred to the next animation
  // frame, so a Download/Share click that lands between a state change and its
  // rAF would export the previous frame — one keystroke behind what the user
  // sees an instant later. Flushing synchronously closes that window.
  //
  // The other half of the race (state committed but drawParams not yet synced)
  // can't happen on a click: React flushes pending passive effects before
  // dispatching the next discrete event, so by the time any click handler
  // runs, the drawParams effect has already run and at most the rAF is
  // outstanding. paint() zeroes paintRaf itself.
  const flushRender = useCallback(() => {
    if (paintRaf.current) {
      cancelAnimationFrame(paintRaf.current);
      paint();
    }
  }, [paint]);

  // Every export consumer goes through these, so Download and Share can never
  // capture a stale bitmap. The canvases are exported at their intrinsic
  // resolution (1080×1080 / 1080×1512 / 1200×630) — toBlob reads the bitmap,
  // not the CSS-scaled display size.
  const getCardCanvas = useCallback(() => {
    flushRender();
    return cardRef.current;
  }, [flushRender]);
  const getPfpCanvas = useCallback(() => {
    flushRender();
    return pfpRef.current;
  }, [flushRender]);
  const getTeamCanvas = useCallback(() => {
    flushRender();
    return teamRef.current;
  }, [flushRender]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reducedMotion.current = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Dev-only escape hatch, no longer surfaced in the UI. `?zoom=full` renders
  // the canvas at 1:1 so new visual work can be checked at actual export
  // resolution rather than scaled down in the page — the convention CLAUDE.md
  // sets for canvas changes, and what the headless screenshot recipe drives.
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

    drawParams.current.teamName = teamName;
    // Slot 1's photo is the page-level upload, not a member-owned one.
    drawParams.current.teamMembers = members.map((member, i) =>
      i === 0 ? { ...member, photo: photo?.image ?? null } : { ...member }
    );
    // Mid-flicker values must never trigger the rare treatment, same rule the
    // card's title chip follows.
    drawParams.current.builderClass = classShuffling
      ? { text: displayClass, tier: 'common' }
      : { ...builderClass, text: displayClass };
    drawParams.current.passId = passShuffling ? displayPassId : passId;

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
    teamName,
    members,
    builderClass,
    displayClass,
    classShuffling,
    passId,
    displayPassId,
    passShuffling,
    schedulePaint,
  ]);

  useEffect(
    () => () => {
      cancelAnimationFrame(paintRaf.current);
      paintRaf.current = 0;
      cancelAnimationFrame(sheenRaf.current);
      sheenRaf.current = 0;
      [timers, classTimers, passTimers].forEach((bucket) => {
        bucket.current.forEach(clearTimeout);
        bucket.current = [];
      });
    },
    []
  );

  // Pass ID exists from the first paint so the canvas never renders an empty
  // chip; regenerating it is the user's call, not a side effect of typing.
  useEffect(() => {
    setPassId(rollPassId());
  }, []);

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

  /* Format C — builder class, pass ID, and member slots ------------------- */

  const landClass = useCallback(
    (next) => {
      setBuilderClass(next);
      setDisplayClass(next.text);
      setClassShuffling(false);
      classPoolRef.current = next.pool;
      if (next.tier === 'rare' && !reducedMotion.current) runSheen();
    },
    [runSheen]
  );

  // The team name is the keyword source here, the way the role is for Format B
  // (schema.md §8) — "Beach Bytes AI" lands in the same pool a role of "AI"
  // would. Rerolls only when the matched pool actually changes, so typing
  // inside one pool doesn't reshuffle on every keystroke.
  useEffect(() => {
    const trimmed = teamName.trim();
    if (!trimmed) {
      classPoolRef.current = null;
      setBuilderClass(EMPTY_TITLE);
      setDisplayClass('');
      return;
    }
    const pool = poolFor(trimmed);
    if (pool !== classPoolRef.current) landClass(rollTitle(trimmed));
  }, [teamName, landClass]);

  const shuffleClass = useCallback(() => {
    const trimmed = teamName.trim();
    if (!trimmed) return;

    classTimers.current.forEach(clearTimeout);
    classTimers.current = [];

    const next = rollTitle(trimmed, { avoid: builderClass.text });
    if (reducedMotion.current) {
      landClass(next);
      return;
    }

    const candidates = flickerCandidates(trimmed, FLICKER_STEPS.length, {
      from: builderClass.text,
      to: next.text,
    });
    setClassShuffling(true);
    FLICKER_STEPS.forEach((delay, i) => {
      classTimers.current.push(setTimeout(() => setDisplayClass(candidates[i]), delay));
    });
    classTimers.current.push(setTimeout(() => landClass(next), FLICKER_LAND));
  }, [teamName, builderClass.text, landClass]);

  const shufflePass = useCallback(() => {
    passTimers.current.forEach(clearTimeout);
    passTimers.current = [];

    const next = rollPassId({ avoid: passId });
    if (reducedMotion.current) {
      setPassId(next);
      setDisplayPassId('');
      setPassShuffling(false);
      return;
    }

    const candidates = flickerPassIds(FLICKER_STEPS.length, { from: passId, to: next });
    setPassShuffling(true);
    FLICKER_STEPS.forEach((delay, i) => {
      passTimers.current.push(setTimeout(() => setDisplayPassId(candidates[i]), delay));
    });
    passTimers.current.push(
      setTimeout(() => {
        setPassId(next);
        setDisplayPassId('');
        setPassShuffling(false);
      }, FLICKER_LAND)
    );
  }, [passId]);

  const onMemberNameChange = useCallback((index, value) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, name: value } : m)));
  }, []);

  const onMemberPhoto = useCallback((index, next, name) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, photo: next?.image ?? null, fileName: name } : m
      )
    );
    // A member photo landing is a newly-uploaded photo, so it earns the reveal
    // on the same terms the other formats use.
    if (next) pendingReveal.current = true;
  }, []);

  const onAddMember = useCallback(() => {
    setMembers((prev) => (prev.length >= TEAM_MAX_MEMBERS ? prev : [...prev, EMPTY_MEMBER]));
  }, []);

  const onRemoveMember = useCallback((index) => {
    // Slot 1 is the uploader and cannot be removed.
    setMembers((prev) => (index === 0 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const onPhoto = useCallback((next, name) => {
    setPhoto(next);
    setFileName(name);
    setPhotoTransform({ panX: 0, panY: 0, zoom: 1 });
  }, []);

  const canvasClass = zoom === 'fit' ? styles.canvasFit : styles.canvasFull;
  const ready = Boolean(name.trim() && role.trim());

  // Slot 1 mirrors the page-level upload so the form and the canvas agree on
  // what "your photo" is.
  const teamMembers = members.map((member, i) =>
    i === 0 ? { ...member, photo: photo?.image ?? null, fileName } : member
  );
  // Members 2–3 are optional (app-flow.md §3b), so only the team name and the
  // uploader's own photo gate the actions.
  const teamReady = Boolean(teamName.trim() && photo);

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
          getCardCanvas={getCardCanvas}
          onDownloaded={bump}
          selectedStickers={selectedStickers}
          onStickersChange={setSelectedStickers}
        />
      )}

      {format === 'team' && (
        <TeamFields
          teamName={teamName}
          members={teamMembers}
          builderClass={builderClass}
          displayClass={displayClass}
          classShuffling={classShuffling}
          passId={passId}
          displayPassId={displayPassId}
          passShuffling={passShuffling}
          onTeamNameChange={setTeamName}
          onMemberNameChange={onMemberNameChange}
          onMemberPhoto={onMemberPhoto}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
          onShuffleClass={shuffleClass}
          onShufflePass={shufflePass}
          ready={teamReady}
          getTeamCanvas={getTeamCanvas}
          onDownloaded={bump}
        />
      )}

      <div className={styles.row}>
        {/* Format C sits outside the flip badge: the badge is a two-sided card
            (Builder ID front, PFP back) and a landscape squad frame is neither
            of its faces. */}
        {format === 'team' ? (
          <figure className={styles.fig}>
            <div className={styles.figHeader}>
              <figcaption className={styles.cap}>1200×630 · TEAM SQUAD FRAME</figcaption>
              <span className={styles.liveBadge}>CANVAS READY</span>
            </div>

            <RevealCanvas
              canvasRef={teamRef}
              width={TEAM_W}
              height={TEAM_H}
              className={canvasClass}
              ariaLabel="Team squad frame preview"
              revealToken={revealToken}
            />
          </figure>
        ) : (
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
                  getCanvas={getPfpCanvas}
                  filename={FILENAMES.pfp}
                  label="DOWNLOAD"
                  onDownloaded={bump}
                />
                <ShareButton
                  getCanvas={getPfpCanvas}
                  format="pfp"
                  filename={FILENAMES.pfp}
                  onShared={bump}
                />
              </div>
            </figure>
          }
        />
        )}
      </div>
    </main>
  );
}
