/**
 * CalendarAgendaView.jsx
 * ---------------------------------------------------------------------------
 * Owner: Person D (Budget / Calendar / Sharing)
 * Blueprint refs: §12.5 (Mobile: "Calendar view switches from month-grid to a
 *                 vertical agenda-list layout... retaining calendar-specific
 *                 chrome (date headers, week markers)"),
 *                 §12.4 (travel divider between city transitions),
 *                 §12.3 (conflict flags on activity rows)
 *
 * Pure/presentational: receives pre-flattened, pre-sorted day data from
 * CalendarTab. Each day is a collapsible section (collapsed: date + city +
 * total cost + activity count; expanded: full activity list) — same pattern
 * as the Builder's Timeline "reading mode," per §12.1.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useCallback } from 'react';
import { ConflictFlag } from './ConflictFlag';

function formatDayHeader(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function weekKey(date) {
  // ISO-ish week grouping: Monday-start week number scoped to the year, good
  // enough for a "Week of ..." marker rather than exact ISO-8601 week math.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

function formatWeekLabel(date) {
  return `Week of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

/**
 * @param {Object} props
 * @param {Array} props.days - flattened day objects from CalendarTab (see its JSDoc)
 * @param {(category: string) => string} props.getCategoryColor
 * @param {(cityId: string, dayId: string) => void} [props.onJumpToItinerary]
 * @param {(activityId: string, patch: object) => void} [props.onQuickEditActivity]
 */
export default function CalendarAgendaView({ days, getCategoryColor, onJumpToItinerary, onQuickEditActivity }) {
  // Collapsed by default except the first day, matching a "scan then dig in" flow.
  const [expanded, setExpanded] = useState(() => new Set(days.length ? [days[0].iso] : []));

  const toggle = useCallback((iso) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(iso) ? next.delete(iso) : next.add(iso);
      return next;
    });
  }, []);

  if (!days.length) return null;

  let lastWeek = null;

  return (
    <div className="gt-agenda" role="list" aria-label="Trip agenda">
      {days.map((day, idx) => {
        const wk = weekKey(day.date);
        const showWeekMarker = wk !== lastWeek;
        lastWeek = wk;

        const showTravelDivider = idx > 0 && day.travelFromCity;
        const isOpen = expanded.has(day.iso);
        const conflictCount = day.activities.filter((a) => a._conflicts.length > 0).length;

        return (
          <div key={day.iso} role="listitem">
            {showWeekMarker && <div className="gt-agenda__week-marker">{formatWeekLabel(day.date)}</div>}

            {showTravelDivider && (
              <div className="gt-agenda__travel-divider">
                ✈ Travel to {day.cityName} — {formatDayHeader(day.date)}
              </div>
            )}

            <div className="gt-agenda__group" style={{ borderLeftColor: day.cityColor }}>
              <button
                type="button"
                className="gt-agenda__group-header"
                onClick={() => toggle(day.iso)}
                aria-expanded={isOpen}
              >
                <span className="gt-agenda__chevron">{isOpen ? '▾' : '▸'}</span>
                <span className="gt-agenda__date">{formatDayHeader(day.date)}</span>
                <span className="gt-agenda__city" style={{ color: day.cityColor }}>
                  {day.cityName}
                </span>
                <span className="gt-agenda__summary">
                  {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'} · $
                  {day.totalCost.toLocaleString()}
                  {conflictCount > 0 && (
                    <span className="gt-agenda__conflict-count"> · {conflictCount} conflict{conflictCount > 1 ? 's' : ''}</span>
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="gt-agenda__body">
                  {day.activities.length === 0 ? (
                    <div className="gt-agenda__empty">No activities planned for this day yet.</div>
                  ) : (
                    day.activities.map((activity) => (
                      <div key={activity.id} className="gt-activity-row">
                        <span
                          className="gt-activity-row__bar"
                          style={{ background: getCategoryColor(activity.category) }}
                        />
                        <input
                          type="time"
                          className="gt-activity-row__time gt-activity-row__time--edit"
                          value={activity.time || ''}
                          aria-label={`Time for ${activity.name}`}
                          onChange={(e) =>
                            onQuickEditActivity && onQuickEditActivity(activity.id, { time: e.target.value })
                          }
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
                              onQuickEditActivity &&
                              onQuickEditActivity(activity.id, { cost: Number(e.target.value) || 0 })
                            }
                          />
                        </span>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    className="gt-agenda__jump-link"
                    onClick={() => onJumpToItinerary && onJumpToItinerary(day.cityId, day.dayId)}
                  >
                    Jump to Itinerary →
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
