/**
 * CalendarTab.jsx
 * ---------------------------------------------------------------------------
 * Owner: Person D (Budget / Calendar / Sharing)
 * Route: /trips/:tripId/calendar (§18)
 * Blueprint refs: §12 (full section), §16.1 (itinerary is shared/read-only
 *                 here — Calendar never fetches separately, it derives from
 *                 the same in-memory trip tree Budget/Itinerary use), §17.1
 *                 (Trip → CityStop → Day → Activity), §19 (loading/empty/error
 *                 states), §6.2/§6.10 (design tokens + category color map)
 *
 * This is the "smart" container: it owns the one piece of local UI state that
 * matters here (which view is showing, which month is in frame), flattens A's
 * nested trip tree into a sorted day-by-day list once via useMemo, and hands
 * fully-prepared data down to the two dumb view components.
 *
 * ---------------------------------------------------------------------------
 * DATA CONTRACT — matches A's fixture (Trip → CityStops → Days → Activities)
 * ---------------------------------------------------------------------------
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} name
 * @property {string} category    - "transport" | "accommodation" | "sightseeing" | "meals" | "other" (case-insensitive)
 * @property {string} [time]      - "HH:MM" 24h
 * @property {number} [durationMin]
 * @property {number} [cost]
 * @property {string} [location]
 *
 * @typedef {Object} Day
 * @property {string} id
 * @property {string} date        - "YYYY-MM-DD"
 * @property {Activity[]} activities
 *
 * @typedef {Object} CityStop
 * @property {string} id
 * @property {string} name
 * @property {number} order
 * @property {Day[]} days
 *
 * @typedef {Object} Trip
 * @property {string} id
 * @property {string} name
 * @property {CityStop[]} cities
 * ---------------------------------------------------------------------------
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CalendarMonthView from './CalendarMonthView';
import CalendarAgendaView from './CalendarAgendaView';
import { detectConflicts } from './ConflictFlag';

// --- §6.10 fixed category → color mapping (same everywhere it appears) -----
const CATEGORY_COLORS = {
  transport: 'var(--gt-secondary, #2B5FA8)',
  accommodation: 'var(--gt-primary, #0E6E5C)',
  sightseeing: 'var(--gt-accent, #E8763C)',
  activity: 'var(--gt-accent, #E8763C)',
  meals: '#A6752E',
  food: '#A6752E',
  other: 'var(--gt-text-muted, #8B8879)',
  misc: 'var(--gt-text-muted, #8B8879)',
};
function getCategoryColor(category) {
  return CATEGORY_COLORS[(category || '').toLowerCase()] || CATEGORY_COLORS.other;
}

// --- §12.4 fixed neutral cycling palette for city color-coding (NOT the
// semantic budget colors) -----------------------------------------------
const CITY_COLOR_CYCLE = ['#4FA8A0', '#6C8FC7', '#D9A441', '#8E6C9C', '#8FA37E'];
function buildCityColorMap(cities) {
  const map = new Map();
  [...cities].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).forEach((c, i) => {
    map.set(c.id, CITY_COLOR_CYCLE[i % CITY_COLOR_CYCLE.length]);
  });
  return map;
}

/** Flattens Trip → CityStops → Days into one chronologically sorted list,
 * attaching per-day conflict info and travel-transition markers. */
function flattenTripDays(trip, cityColorMap) {
  const days = [];
  (trip?.cities || []).forEach((city) => {
    (city.days || []).forEach((day) => {
      const conflicts = detectConflicts(day.activities || []);
      const activities = (day.activities || [])
        .map((a) => ({ ...a, _conflicts: conflicts.get(a.id) || [] }))
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      const totalCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

      days.push({
        iso: day.date,
        date: new Date(`${day.date}T00:00:00`),
        dayId: day.id,
        cityId: city.id,
        cityName: city.name,
        cityColor: cityColorMap.get(city.id),
        activities,
        totalCost,
      });
    });
  });

  days.sort((a, b) => a.date - b.date);

  // Mark the first day of each new city (skip the very first day overall).
  for (let i = 1; i < days.length; i++) {
    if (days[i].cityId !== days[i - 1].cityId) {
      days[i].travelFromCity = days[i - 1].cityName;
    }
  }

  return days;
}

/** Tracks viewport width against the §14 mobile breakpoint (<768px). */
function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    setIsMobile(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [breakpoint]);
  return isMobile;
}

/** Persists the user's desktop view preference (Month vs Agenda) per trip. */
function usePersistedView(tripId) {
  const key = `gt:calendarView:${tripId || 'default'}`;
  const [view, setViewState] = useState(() => {
    try {
      return window.localStorage.getItem(key) || 'month';
    } catch {
      return 'month';
    }
  });
  const setView = useCallback(
    (next) => {
      setViewState(next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        /* non-critical — local UI preference only, per §16.1 */
      }
    },
    [key]
  );
  return [view, setView];
}

/**
 * @param {Object} props
 * @param {Trip} [props.trip]
 * @param {boolean} [props.isLoading]
 * @param {string} [props.error]
 * @param {() => void} [props.onRetry]
 * @param {(cityId: string, dayId: string) => void} [props.onJumpToItinerary]
 * @param {(activityId: string, patch: object) => void} [props.onQuickEditActivity]
 */
export default function CalendarTab({
  trip,
  isLoading = false,
  error = null,
  onRetry,
  onJumpToItinerary,
  onQuickEditActivity,
}) {
  const isMobile = useIsMobile();
  const [preferredView, setPreferredView] = usePersistedView(trip?.id);
  // Mobile is a forced redesign, not a user choice (§12.5) — desktop respects preference.
  const view = isMobile ? 'agenda' : preferredView;

  const cityColorMap = useMemo(() => buildCityColorMap(trip?.cities || []), [trip]);
  const days = useMemo(() => flattenTripDays(trip, cityColorMap), [trip, cityColorMap]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const first = days[0]?.date;
    const base = first || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Re-anchor the visible month once real day data arrives (e.g. after loading).
  useEffect(() => {
    if (days.length) {
      setCurrentMonth(new Date(days[0].date.getFullYear(), days[0].date.getMonth(), 1));
    }
  }, [days.length ? days[0].iso : null]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasContent = days.some((d) => d.activities.length > 0);

  return (
    <div className="gt-cal">
      <GlobalCalendarStyles />

      <div className="gt-cal__header">
        <div>
          <h2 className="gt-cal__title">Calendar</h2>
          <p className="gt-cal__subtitle">
            {trip?.name ? `${trip.name} — ` : ''}
            day-by-day view of your itinerary
          </p>
        </div>

        {!isMobile && (
          <div className="gt-cal__toggle" role="group" aria-label="Calendar display mode">
            <button
              type="button"
              className={`gt-cal__toggle-btn ${view === 'month' ? 'is-active' : ''}`}
              onClick={() => setPreferredView('month')}
            >
              Month
            </button>
            <button
              type="button"
              className={`gt-cal__toggle-btn ${view === 'agenda' ? 'is-active' : ''}`}
              onClick={() => setPreferredView('agenda')}
            >
              Agenda
            </button>
          </div>
        )}
      </div>

      {cityColorMap.size > 0 && (
        <div className="gt-cal__legend" aria-label="City color key">
          {[...trip.cities]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((c) => (
              <span key={c.id} className="gt-cal__legend-item">
                <span className="gt-cal__legend-dot" style={{ background: cityColorMap.get(c.id) }} />
                {c.name}
              </span>
            ))}
        </div>
      )}

      {isLoading && <CalendarSkeleton isMobile={isMobile} />}

      {!isLoading && error && (
        <div className="gt-cal__error">
          <p>Couldn&apos;t load your calendar — {error}</p>
          <button type="button" className="gt-cal__retry" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && !hasContent && (
        <div className="gt-cal__empty">
          <p className="gt-cal__empty-title">Nothing to show yet</p>
          <p className="gt-cal__empty-sub">
            Add cities and activities in the Itinerary Builder and they&apos;ll show up here automatically.
          </p>
          <button type="button" className="gt-cal__empty-cta" onClick={() => onJumpToItinerary && onJumpToItinerary()}>
            Go to Itinerary Builder
          </button>
        </div>
      )}

      {!isLoading && !error && hasContent && view === 'month' && (
        <CalendarMonthView
          days={days}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          getCategoryColor={getCategoryColor}
          onJumpToItinerary={onJumpToItinerary}
          onQuickEditActivity={onQuickEditActivity}
        />
      )}

      {!isLoading && !error && hasContent && view === 'agenda' && (
        <CalendarAgendaView
          days={days}
          getCategoryColor={getCategoryColor}
          onJumpToItinerary={onJumpToItinerary}
          onQuickEditActivity={onQuickEditActivity}
        />
      )}
    </div>
  );
}

function CalendarSkeleton({ isMobile }) {
  const blocks = isMobile ? 5 : 35;
  return (
    <div className={isMobile ? 'gt-cal__skeleton gt-cal__skeleton--agenda' : 'gt-cal__skeleton gt-cal__skeleton--grid'}>
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={i} className="gt-cal__skeleton-block" />
      ))}
    </div>
  );
}

/**
 * Design tokens (§6.2) as CSS custom properties with exact fallback hex
 * values, plus every class used by CalendarTab/MonthView/AgendaView. If B's
 * global stylesheet already defines these same --gt-* variables, this block
 * simply inherits them — no conflict, no duplicate source of truth.
 */
function GlobalCalendarStyles() {
  return (
    <style>{`
      .gt-cal {
        --gt-bg-canvas: #FBFAF7; --gt-surface: #FFFFFF; --gt-surface-alt: #F3F1EB;
        --gt-border: #E4E0D6; --gt-text-primary: #1C1B18; --gt-text-secondary: #5B594F;
        --gt-text-muted: #8B8879; --gt-primary: #0E6E5C; --gt-primary-hover: #0A5548;
        --gt-primary-tint: #E1F1EC; --gt-accent: #E8763C; --gt-accent-tint: #FCEADD;
        --gt-secondary: #2B5FA8; --gt-success: #1E8E5A; --gt-warning: #C98A1E;
        --gt-danger: #C43D3D; --gt-info: #2B5FA8;
        font-family: Inter, system-ui, sans-serif; color: var(--gt-text-primary);
        background: var(--gt-bg-canvas); padding: 24px; border-radius: 12px;
      }
      .gt-cal__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
      .gt-cal__title { font-family: Fraunces, Georgia, serif; font-size: 24px; font-weight: 600; margin: 0; }
      .gt-cal__subtitle { font-size: 13px; color: var(--gt-text-secondary); margin: 4px 0 0; }
      .gt-cal__toggle { display: inline-flex; border: 1px solid var(--gt-border); border-radius: 8px; overflow: hidden; }
      .gt-cal__toggle-btn { border: none; background: var(--gt-surface); color: var(--gt-text-secondary); font-size: 13px; padding: 6px 14px; cursor: pointer; }
      .gt-cal__toggle-btn.is-active { background: var(--gt-primary); color: #fff; }
      .gt-cal__legend { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 16px; }
      .gt-cal__legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--gt-text-secondary); }
      .gt-cal__legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

      .gt-cal__nav { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
      .gt-cal__nav-btn, .gt-cal__nav-today { border: 1px solid var(--gt-border); background: var(--gt-surface); border-radius: 8px; padding: 4px 10px; cursor: pointer; font-size: 13px; color: var(--gt-text-primary); }
      .gt-cal__nav-label { font-weight: 600; font-size: 15px; min-width: 150px; text-align: center; }

      .gt-cal__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
      .gt-cal__weekday { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--gt-text-muted); text-align: center; padding: 4px 0; }
      .gt-cal__cell { background: var(--gt-surface); border: 1px solid var(--gt-border); border-left: 3px solid transparent; border-radius: 10px; min-height: 92px; padding: 6px 8px; cursor: default; display: flex; flex-direction: column; gap: 2px; }
      .gt-cal__cell.is-filled { cursor: pointer; }
      .gt-cal__cell.is-filled:hover { box-shadow: 0 6px 20px rgba(28,27,24,0.10); border-color: var(--gt-primary); }
      .gt-cal__cell.is-outside { opacity: 0.35; }
      .gt-cal__cell.is-today { background: var(--gt-primary-tint); }
      .gt-cal__cell-top { display: flex; justify-content: space-between; align-items: center; }
      .gt-cal__cell-date { font-size: 13px; font-weight: 600; }
      .gt-cal__cell-city { font-size: 11px; font-weight: 600; }
      .gt-cal__cell-chip { font-size: 11px; color: var(--gt-text-secondary); }
      .gt-cal__cell-chip--muted { color: var(--gt-text-muted); }

      .gt-cal__popover-backdrop { position: fixed; inset: 0; background: rgba(28,27,24,0.25); display: flex; align-items: center; justify-content: center; z-index: 50; }
      .gt-cal__popover { background: var(--gt-surface); border-radius: 12px; box-shadow: 0 6px 20px rgba(28,27,24,0.10); width: 360px; max-width: 90vw; max-height: 80vh; overflow-y: auto; padding: 16px; }
      .gt-cal__popover-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
      .gt-cal__popover-date { font-weight: 600; font-size: 15px; }
      .gt-cal__popover-city { font-size: 12px; font-weight: 600; }
      .gt-cal__popover-close { border: none; background: none; font-size: 20px; line-height: 1; cursor: pointer; color: var(--gt-text-muted); }
      .gt-cal__popover-list { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }
      .gt-cal__popover-empty { font-size: 13px; color: var(--gt-text-muted); border: 1px dashed var(--gt-border); border-radius: 8px; padding: 12px; text-align: center; }
      .gt-cal__popover-footer { border-top: 1px solid var(--gt-border); padding-top: 10px; }
      .gt-cal__popover-link, .gt-agenda__jump-link, .gt-cal__empty-cta, .gt-cal__retry { border: none; background: none; color: var(--gt-primary); font-weight: 600; font-size: 13px; cursor: pointer; padding: 0; }

      .gt-activity-row { display: flex; align-items: center; gap: 8px; padding: 6px 4px; border-radius: 6px; }
      .gt-activity-row:hover { background: var(--gt-surface-alt); }
      .gt-activity-row__bar { width: 3px; align-self: stretch; border-radius: 2px; flex-shrink: 0; }
      .gt-activity-row__time--edit { border: 1px solid transparent; background: transparent; font-size: 12px; color: var(--gt-text-secondary); width: 78px; border-radius: 6px; }
      .gt-activity-row__time--edit:hover, .gt-activity-row__time--edit:focus { border-color: var(--gt-border); background: var(--gt-surface); }
      .gt-activity-row__name { flex: 1; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
      .gt-activity-row__cost-wrap { font-size: 12px; color: var(--gt-text-secondary); display: inline-flex; align-items: center; }
      .gt-activity-row__cost--edit { width: 52px; border: 1px solid transparent; background: transparent; font-size: 12px; text-align: right; border-radius: 6px; }
      .gt-activity-row__cost--edit:hover, .gt-activity-row__cost--edit:focus { border-color: var(--gt-border); background: var(--gt-surface); }

      .gt-agenda { display: flex; flex-direction: column; gap: 4px; }
      .gt-agenda__week-marker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--gt-text-muted); margin: 14px 0 4px; }
      .gt-agenda__travel-divider { font-size: 12px; color: var(--gt-text-secondary); padding: 6px 0; border-top: 1px dashed var(--gt-border); border-bottom: 1px dashed var(--gt-border); margin: 6px 0; }
      .gt-agenda__group { background: var(--gt-surface); border: 1px solid var(--gt-border); border-left: 3px solid transparent; border-radius: 10px; margin-bottom: 6px; overflow: hidden; }
      .gt-agenda__group-header { width: 100%; display: flex; align-items: center; gap: 10px; background: none; border: none; padding: 10px 12px; cursor: pointer; text-align: left; font-size: 13px; }
      .gt-agenda__chevron { color: var(--gt-text-muted); width: 12px; }
      .gt-agenda__date { font-weight: 600; min-width: 96px; }
      .gt-agenda__city { font-weight: 600; font-size: 12px; }
      .gt-agenda__summary { margin-left: auto; color: var(--gt-text-secondary); font-size: 12px; }
      .gt-agenda__conflict-count { color: var(--gt-warning); }
      .gt-agenda__body { padding: 4px 12px 12px; display: flex; flex-direction: column; gap: 4px; }
      .gt-agenda__empty { font-size: 13px; color: var(--gt-text-muted); border: 1px dashed var(--gt-border); border-radius: 8px; padding: 10px; text-align: center; }

      .gt-cal__skeleton--grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
      .gt-cal__skeleton--agenda { display: flex; flex-direction: column; gap: 8px; }
      .gt-cal__skeleton-block { background: var(--gt-surface-alt); border-radius: 10px; height: 92px; animation: gt-pulse 1.4s ease-in-out infinite; }
      .gt-cal__skeleton--agenda .gt-cal__skeleton-block { height: 48px; }
      @keyframes gt-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }

      .gt-cal__empty, .gt-cal__error { text-align: center; padding: 48px 16px; border: 1px dashed var(--gt-border); border-radius: 12px; }
      .gt-cal__empty-title { font-weight: 600; font-size: 15px; margin: 0 0 4px; }
      .gt-cal__empty-sub { font-size: 13px; color: var(--gt-text-secondary); margin: 0 0 12px; }
      .gt-cal__error { color: var(--gt-danger); font-size: 13px; }

      @media (prefers-reduced-motion: reduce) {
        .gt-cal__skeleton-block { animation: none; }
      }
    `}</style>
  );
}
