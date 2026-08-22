/**
 * ConflictFlag.jsx
 * ---------------------------------------------------------------------------
 * Owner: Person D (Budget / Calendar / Sharing)
 * Blueprint refs: §9.2 (overlap treatment), §12.3 (Calendar conflict surfacing),
 *                 §6.10 (semantic color: warning = #C98A1E)
 *
 * Pure, dependency-free conflict detection + two small presentational pieces:
 *   - <ConflictFlag />  -> inline warning triangle for an activity row/card
 *   - <ConflictDot />   -> tiny warning dot for a calendar day-cell badge
 *
 * This file has no dependency on trip/city data shape beyond a flat list of
 * activities for a single day, so A (Builder) and C (nothing direct) can also
 * import `detectConflicts` if they want the same overlap logic in the
 * Itinerary Builder's day sections, without re-implementing it.
 * ---------------------------------------------------------------------------
 */

import React from 'react';

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} name
 * @property {string} [time]        - "HH:MM" 24-hour, e.g. "09:30"
 * @property {number} [durationMin] - defaults to 60 if omitted
 */

/** "HH:MM" -> minutes since midnight, or null if missing/invalid. */
function toMinutes(time) {
  if (!time || typeof time !== 'string') return null;
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Detects pairwise time overlaps among a single day's activities.
 * O(n log n) — sorts by start time, then sweeps.
 *
 * @param {Activity[]} activities
 * @returns {Map<string, Activity[]>} activity id -> list of activities it conflicts with
 */
export function detectConflicts(activities = []) {
  const conflicts = new Map();

  const timed = activities
    .map((a) => {
      const start = toMinutes(a.time);
      if (start === null) return null;
      const durationMin = Number.isFinite(a.durationMin) ? a.durationMin : 60;
      return { ...a, _start: start, _end: start + Math.max(durationMin, 0) };
    })
    .filter(Boolean)
    .sort((a, b) => a._start - b._start);

  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      if (timed[j]._start < timed[i]._end) {
        if (!conflicts.has(timed[i].id)) conflicts.set(timed[i].id, []);
        if (!conflicts.has(timed[j].id)) conflicts.set(timed[j].id, []);
        conflicts.get(timed[i].id).push(timed[j]);
        conflicts.get(timed[j].id).push(timed[i]);
      } else {
        // Sorted by start time: once timed[j] starts after timed[i] ends,
        // every later j (later start) can't overlap timed[i] either.
        break;
      }
    }
  }

  return conflicts;
}

/**
 * Inline warning flag for an activity row/card that overlaps another.
 * Renders nothing if there's no conflict — safe to always mount.
 */
export function ConflictFlag({ conflictsWith = [], size = 14 }) {
  if (!conflictsWith.length) return null;

  const label =
    conflictsWith.length === 1
      ? `Overlaps with ${conflictsWith[0].name}`
      : `Overlaps with ${conflictsWith.length} other activities`;

  return (
    <span
      title={label}
      aria-label={label}
      role="img"
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2 L18 17 H2 Z" fill="var(--gt-warning, #C98A1E)" opacity="0.15" />
        <path
          d="M10 2 L18 17 H2 Z"
          stroke="var(--gt-warning, #C98A1E)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="10" y1="7.5" x2="10" y2="11.5" stroke="var(--gt-warning, #C98A1E)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="10" cy="14" r="0.9" fill="var(--gt-warning, #C98A1E)" />
      </svg>
    </span>
  );
}

/**
 * Small dot badge for a calendar day-cell that contains at least one conflict.
 * Per §12.3: "a small warning-dot badge on the cell if that day contains a
 * time conflict, discoverable on expansion."
 */
export function ConflictDot({ count = 0 }) {
  if (!count) return null;
  const label = count === 1 ? '1 time conflict this day' : `${count} time conflicts this day`;
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--gt-warning, #C98A1E)',
        boxShadow: '0 0 0 2px var(--gt-surface, #FFFFFF)',
      }}
    />
  );
}

export default ConflictFlag;
