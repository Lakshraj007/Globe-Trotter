/**
 * CalendarMonthView.jsx
 * ---------------------------------------------------------------------------
 * Owner: Person D (Budget / Calendar / Sharing)
 * Blueprint refs: §12.1 (Calendar view), §12.4 (city color coding),
 *                 §12.3 (conflict dot), §12.5 (desktop/tablet only — Mobile
 *                 uses CalendarAgendaView instead), §15 (CalendarMonthGrid,
 *                 DayDetailPopover)
 *
 * Pure/presentational: receives pre-flattened, pre-sorted day data from
 * CalendarTab (the "smart" container) and renders a standard 6x7 month grid.
 * Does not fetch or mutate trip data itself.
 * ---------------------------------------------------------------------------
 */

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { ConflictDot, ConflictFlag } from './ConflictFlag';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function sameDay(a, b) {
  return isoDate(a) === isoDate(b);
}

/** Builds the 42 (6x7) leading/trailing-padded cell dates for a given month. */
function buildMonthCells(currentMonth) {
  const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startOffset = first.getDay(); // 0=Sun
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function formatMonthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatPopoverDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

/**
 * @param {Object} props
 * @param {Array} props.days            - flattened day objects from CalendarTab (see its JSDoc)
 * @param {Date} props.currentMonth      - first-of-month anchor date
 * @param {(next: Date) => void} props.onMonthChange
 * @param {(category: string) => string} props.getCategoryColor
 * @param {(cityId: string, dayId: string) => void} [props.onJumpToItinerary]
 * @param {(activityId: string, patch: object) => void} [props.onQuickEditActivity]
 */
export default function CalendarMonthView({
  days,
  currentMonth,
  onMonthChange,
  getCategoryColor,
  onJumpToItinerary,
  onQuickEditActivity,
}) {
  const dayMap = useMemo(() => {
    const m = new Map();
    days.forEach((d) => m.set(d.iso, d));
    return m;
  }, [days]);

  const cells = useMemo(() => buildMonthCells(currentMonth), [currentMonth]);
  const today = useMemo(() => new Date(), []);

  const [popoverIso, setPopoverIso] = useState(null);
  const popoverRef = useRef(null);

  const closePopover = useCallback(() => setPopoverIso(null), []);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!popoverIso) return undefined;
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) closePopover();
    }
    function handleKey(e) {
      if (e.key === 'Escape') closePopover();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [popoverIso, closePopover]);

  const goPrevMonth = () => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const goNextMonth = () => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToday = () => onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));

  const popoverDay = popoverIso ? dayMap.get(popoverIso) : null;

  return (
    <div className="gt-cal__month">
      <div className="gt-cal__nav" role="group" aria-label="Change month">
        <button type="button" className="gt-cal__nav-btn" onClick={goPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className="gt-cal__nav-label">{formatMonthLabel(currentMonth)}</span>
        <button type="button" className="gt-cal__nav-btn" onClick={goNextMonth} aria-label="Next month">
          ›
        </button>
        <button type="button" className="gt-cal__nav-today" onClick={goToday}>
          Today
        </button>
      </div>

      <div className="gt-cal__grid" role="grid" aria-label={formatMonthLabel(currentMonth)}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="gt-cal__weekday" role="columnheader">
            {w}
          </div>
        ))}

        {cells.map((cellDate) => {
          const iso = isoDate(cellDate);
          const day = dayMap.get(iso);
          const outside = !sameMonth(cellDate, currentMonth);
          const isToday = sameDay(cellDate, today);
          const conflictCount = day ? day.activities.filter((a) => a._conflicts.length > 0).length : 0;

          return (
            <div
              key={iso}
              role="gridcell"
              tabIndex={day ? 0 : -1}
              aria-label={
                day
                  ? `${cellDate.toDateString()}, ${day.cityName}, ${day.activities.length} activities, $${day.totalCost}`
                  : cellDate.toDateString()
              }
              className={[
                'gt-cal__cell',
                outside ? 'is-outside' : '',
                isToday ? 'is-today' : '',
                day ? 'is-filled' : 'is-empty',
              ]
                .filter(Boolean)
                .join(' ')}
              style={day ? { borderLeftColor: day.cityColor } : undefined}
              onClick={() => day && setPopoverIso(iso)}
              onKeyDown={(e) => {
                if (day && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setPopoverIso(iso);
                }
              }}
            >
              <div className="gt-cal__cell-top">
                <span className="gt-cal__cell-date">{cellDate.getDate()}</span>
                {conflictCount > 0 && <ConflictDot count={conflictCount} />}
              </div>

              {day && (
                <>
                  <span className="gt-cal__cell-city" style={{ color: day.cityColor }}>
                    {day.cityName}
                  </span>
                  {day.activities.length > 0 ? (
                    <span className="gt-cal__cell-chip">
                      {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'} · $
                      {day.totalCost.toLocaleString()}
                    </span>
                  ) : (
                    <span className="gt-cal__cell-chip gt-cal__cell-chip--muted">No activities</span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {popoverDay && (
        <div className="gt-cal__popover-backdrop">
          <div className="gt-cal__popover" ref={popoverRef} role="dialog" aria-modal="true" aria-label={formatPopoverDate(popoverDay.date)}>
            <div className="gt-cal__popover-header">
              <div>
                <div className="gt-cal__popover-date">{formatPopoverDate(popoverDay.date)}</div>
                <div className="gt-cal__popover-city" style={{ color: popoverDay.cityColor }}>
                  {popoverDay.cityName} · ${popoverDay.totalCost.toLocaleString()} total
                </div>
              </div>
              <button type="button" className="gt-cal__popover-close" onClick={closePopover} aria-label="Close">
                ×
              </button>
            </div>

            <div className="gt-cal__popover-list">
              {popoverDay.activities.length === 0 && (
                <div className="gt-cal__popover-empty">No activities planned for this day yet.</div>
              )}
              {popoverDay.activities.map((activity) => (
                <div key={activity.id} className="gt-activity-row">
                  <span className="gt-activity-row__bar" style={{ background: getCategoryColor(activity.category) }} />
                  <input
                    type="time"
                    className="gt-activity-row__time gt-activity-row__time--edit"
                    value={activity.time || ''}
                    aria-label={`Time for ${activity.name}`}
                    onChange={(e) => onQuickEditActivity && onQuickEditActivity(activity.id, { time: e.target.value })}
                  />
                  <span className="gt-activity-row__name">
                    {activity.name}
                    <ConflictFlag conflictsWith={activity._conflicts} />
                  </span>
                  <span className="gt-activity-row__cost-wrap">
                    $
                    <input
                      type="number"
                      min="0"
                      className="gt-activity-row__cost gt-activity-row__cost--edit"
                      value={activity.cost ?? ''}
                      aria-label={`Cost for ${activity.name}`}
                      onChange={(e) =>
                        onQuickEditActivity && onQuickEditActivity(activity.id, { cost: Number(e.target.value) || 0 })
                      }
                    />
                  </span>
                </div>
              ))}
            </div>

            <div className="gt-cal__popover-footer">
              <button
                type="button"
                className="gt-cal__popover-link"
                onClick={() => onJumpToItinerary && onJumpToItinerary(popoverDay.cityId, popoverDay.dayId)}
              >
                Jump to Itinerary →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
