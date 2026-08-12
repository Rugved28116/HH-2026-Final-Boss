'use client';

import DownloadButton from './DownloadButton';
import ShareButton from './ShareButton';
import UploadZone from './UploadZone';
import { FILENAMES } from '@/lib/export/download';
import { TEAM_MAX_MEMBERS } from '@/lib/render/team';
import styles from './TeamFields.module.css';

export const TEAM_NAME_MAX = 32;
export const MEMBER_NAME_MAX = 18;

/**
 * Format C's control rail (app-flow.md §4b).
 *
 * Member slots are disclosed progressively: slot 1 is always present and uses
 * the page's existing upload flow, slots 2–3 appear one at a time behind
 * "+ Member N". Showing all three dropzones up front would read as three
 * required fields when two of them are optional.
 */
export default function TeamFields({
  teamName,
  members,
  builderClass,
  displayClass,
  classShuffling,
  passId,
  displayPassId,
  passShuffling,
  onTeamNameChange,
  onMemberNameChange,
  onMemberPhoto,
  onAddMember,
  onRemoveMember,
  onShuffleClass,
  onShufflePass,
  ready,
  getTeamCanvas,
  onDownloaded,
}) {
  const isRare = builderClass?.tier === 'rare' && !classShuffling;
  const canAdd = members.length < TEAM_MAX_MEMBERS;

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span className={styles.label}>01 // TEAM NAME</span>
        <input
          className={styles.input}
          type="text"
          value={teamName}
          maxLength={TEAM_NAME_MAX}
          placeholder="Beach Bytes"
          onChange={(e) => onTeamNameChange(e.target.value)}
        />
      </label>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label}>02 // SQUAD ({members.length}/{TEAM_MAX_MEMBERS})</span>
        </div>

        <ul className={styles.slots}>
          {members.map((member, i) => (
            <li key={i} className={styles.slot}>
              <div className={styles.slotHead}>
                <span className={styles.slotTag}>BUILDER {String(i + 1).padStart(2, '0')}</span>
                {i === 0 ? (
                  <span className={styles.slotYou}>YOU</span>
                ) : (
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => onRemoveMember(i)}
                    aria-label={`Remove member ${i + 1}`}
                  >
                    ✕
                  </button>
                )}
              </div>

              <input
                className={styles.input}
                type="text"
                value={member.name}
                maxLength={MEMBER_NAME_MAX}
                placeholder={i === 0 ? 'Your name' : `Member ${i + 1} name`}
                onChange={(e) => onMemberNameChange(i, e.target.value)}
              />

              {/* Slot 1 draws from the page-level upload zone shared with the
                  other two formats, so there is only ever one "your photo". */}
              {i === 0 ? (
                <p className={styles.slotHint}>
                  {member.photo ? '✓ Using your uploaded photo' : '↑ Drop your photo above'}
                </p>
              ) : (
                <UploadZone
                  onPhoto={(photo, fileName) => onMemberPhoto(i, photo, fileName)}
                  fileName={member.fileName}
                />
              )}
            </li>
          ))}
        </ul>

        {canAdd && (
          <button type="button" className={styles.addMember} onClick={onAddMember}>
            + MEMBER {members.length + 1}
          </button>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label}>03 // BUILDER CLASS</span>
          {isRare && <span className={styles.rareBadge}>✨ RARE UNLOCKED</span>}
        </div>

        <div className={styles.genRow}>
          <output
            className={`${styles.generated} ${isRare ? styles.generatedRare : ''}`}
            aria-live={classShuffling ? 'off' : 'polite'}
          >
            <span className={styles.promptPrefix}>&gt;</span>
            <span className={styles.genText}>
              {displayClass || <span className={styles.genEmpty}>name your team to generate</span>}
            </span>
          </output>
          <button
            type="button"
            className={styles.shuffle}
            onClick={onShuffleClass}
            disabled={!teamName.trim()}
            aria-label="Shuffle builder class"
            title="Shuffle builder class"
          >
            🎲
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>04 // UNIQUE PASS ID</span>
        <div className={styles.genRow}>
          <output
            className={`${styles.generated} ${styles.generatedPass}`}
            aria-live={passShuffling ? 'off' : 'polite'}
          >
            <span className={styles.promptPrefix}>#</span>
            <span className={styles.genText}>{displayPassId || passId}</span>
          </output>
          <button
            type="button"
            className={styles.shuffle}
            onClick={onShufflePass}
            aria-label="Shuffle pass ID"
            title="Shuffle pass ID"
          >
            🎲
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <DownloadButton
          getCanvas={getTeamCanvas}
          filename={FILENAMES.team}
          disabled={!ready}
          className={styles.primary}
          onDownloaded={onDownloaded}
        />
        <ShareButton
          getCanvas={getTeamCanvas}
          format="team"
          filename={FILENAMES.team}
          disabled={!ready}
          onShared={onDownloaded}
        />
      </div>

      {!ready && (
        <p className={styles.gateHint}>
          💡 Add a team name and your own photo to enable squad actions.
        </p>
      )}
    </div>
  );
}
