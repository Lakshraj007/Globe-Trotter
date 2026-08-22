/**
 * PublicTripPage.jsx
 * ---------------------------------------------------------------------------
 * Owner: Person D (Budget / Calendar / Sharing)
 * Route: /share/:shareId (public, §18)
 * Blueprint refs: §13 (full section — content, layout, responsive),
 *                 §2.2 ("Viewing someone else's public itinerary" +
 *                 "Copying a public itinerary"), §17.1 (Trip → CityStop →
 *                 Day → Activity), §19 (share/public page loading/error states)
 *
 * §13.2 constraints this file follows exactly:
 *   - No app shell chrome (no navbar-with-search, no "+ New Trip").
 *   - No tabs — single scrollable page (Timeline, then Budget).
 *   - No inline editing anywhere — everything renders as static info.
 *   - No City Rail sidebar — a simple chip row instead of an interactive rail.
 *
 * §15 marks ActivityCard/DaySection as reusable across Builder, Timeline, and
 * this page via a `readOnly` prop. Since A's real components may not exist
 * yet, this file accepts them as optional injected props (`DaySectionComponent`
 * / `ActivityCardComponent`) and falls back to a small built-in read-only
 * renderer otherwise — so this page works standalone today and picks up A's
 * real components later with a one-line prop change, no rewrite.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useState } from 'react';
import { cloneTrip } from './CloneTripHandler';

// --- §6.10 fixed category → color mapping — MUST match CalendarTab.jsx's
// mapping exactly, since "the same category is always the same color
// everywhere it appears (budget tab, itinerary sidebar, admin)". -----------
const CATEGORY_COLORS = {
  transport: '#2B5FA8',
  accommodation: '#0E6E5C',
  sightseeing: '#E8763C',
  activity: '#E8763C',
  meals: '#A6752E',
  food: '#A6752E',
  other: '#8B8879',
  misc: '#8B8879',
};
function getCategoryColor(category) {
  return CATEGORY_COLORS[(category || '').toLowerCase()] || CATEGORY_COLORS.other;
}

// --- §12.4 neutral city cycling palette, reused here purely for the chip row.
const CITY_COLOR_CYCLE = ['#4FA8A0', '#6C8FC7', '#D9A441', '#8E6C9C', '#8FA37E'];

/** Deterministic gradient hue from a string — used for the cover placeholder
 *  when no photo is set, per §7.2 / §6.12's "deterministic hue" guidance. */
function hueFromString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 360;
  return hash;
}

function formatDateRange(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const opts = { month: 'short', day: 'numeric' };
  const start = new Date(`${startIso}T00:00:00`).toLocaleDateString(undefined, opts);
  const end = new Date(`${endIso}T00:00:00`).toLocaleDateString(undefined, opts);
  return `${start} – ${end}`;
}

function countTripDays(cities) {
  return (cities || []).reduce((sum, c) => sum + (c.days?.length || 0), 0);
}

function computeBudget(cities) {
  const byCategory = {};
  let total = 0;
  (cities || []).forEach((city) => {
    (city.days || []).forEach((day) => {
      (day.activities || []).forEach((a) => {
        const cost = Number(a.cost) || 0;
        const cat = (a.category || 'other').toLowerCase();
        byCategory[cat] = (byCategory[cat] || 0) + cost;
        total += cost;
      });
    });
  });
  return { total, byCategory };
}

/** Minimal read-only day/activity renderer, used only if A's real
 *  DaySection/ActivityCard aren't injected yet. */
function FallbackReadOnlyDay({ day, cityColor }) {
  return (
    <div className="gt-public__day">
      <div className="gt-public__day-header">
        <span className="gt-public__day-bar" style={{ background: cityColor }} />
        <span className="gt-public__day-title">
          {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="gt-public__day-cost">
          ${(day.activities || []).reduce((sum, a) => sum + (Number(a.cost) || 0), 0).toLocaleString()}
        </span>
      </div>
      {(day.activities || []).length === 0 ? (
        <div className="gt-public__day-empty">No activities planned this day.</div>
      ) : (
        (day.activities || []).map((a) => (
          <div key={a.id} className="gt-public__activity-row">
            <span className="gt-public__activity-bar" style={{ background: getCategoryColor(a.category) }} />
            <span className="gt-public__activity-time">{a.time || ''}</span>
            <span className="gt-public__activity-name">{a.name}</span>
            {a.location && <span className="gt-public__activity-location">{a.location}</span>}
            <span className="gt-public__activity-cost">{a.cost ? `$${Number(a.cost).toLocaleString()}` : ''}</span>
          </div>
        ))
      )}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} [props.trip]        - pre-fetched public trip; omit and pass `shareId` to self-fetch
 * @param {string} [props.shareId]
 * @param {typeof fetch} [props.fetchImpl]
 * @param {string} [props.apiBaseUrl]
 * @param {Object|null} [props.currentUser] - if logged in, a minimal top bar shows (§13.2)
 * @param {(path: string) => void} props.navigate
 * @param {(toast: { type: 'success'|'error', message: string }) => void} [props.showToast]
 * @param {React.ComponentType} [props.DaySectionComponent] - A's real component, readOnly-capable (§15.1)
 */
export default function PublicTripPage({
  trip: tripProp,
  shareId,
  fetchImpl = typeof fetch !== 'undefined' ? fetch : undefined,
  apiBaseUrl = '',
  currentUser,
  navigate,
  showToast,
  DaySectionComponent,
}) {
  const [trip, setTrip] = useState(tripProp || null);
  const [status, setStatus] = useState(tripProp ? 'ready' : 'loading'); // loading | ready | revoked | error
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    if (tripProp || !shareId || !fetchImpl) return;
    let cancelled = false;
    setStatus('loading');

    fetchImpl(`${apiBaseUrl}/share/${shareId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setStatus('revoked');
          return;
        }
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const data = await res.json();
        setTrip(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [shareId, tripProp, fetchImpl, apiBaseUrl]);

  const cityColorMap = useMemo(() => {
    const map = new Map();
    (trip?.cities || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((c, i) => map.set(c.id, CITY_COLOR_CYCLE[i % CITY_COLOR_CYCLE.length]));
    return map;
  }, [trip]);

  const budget = useMemo(() => computeBudget(trip?.cities), [trip]);
  const dayCount = useMemo(() => countTripDays(trip?.cities), [trip]);

  const handleClone = async () => {
    if (!trip || isCloning) return;
    setIsCloning(true);
    await cloneTrip({ trip, currentUser, navigate, showToast, fetchImpl, apiBaseUrl });
    setIsCloning(false);
  };

  if (status === 'loading') {
    return (
      <div className="gt-public gt-public--center">
        <GlobalPublicPageStyles />
        <div className="gt-public__skeleton-hero" />
        <div className="gt-public__skeleton-line" />
        <div className="gt-public__skeleton-line" style={{ width: '60%' }} />
      </div>
    );
  }

  if (status === 'revoked') {
    return (
      <div className="gt-public gt-public--center">
        <GlobalPublicPageStyles />
        <div className="gt-public__revoked">
          <p className="gt-public__revoked-title">This trip is no longer shared</p>
          <p className="gt-public__revoked-sub">The owner has made this itinerary private, or the link has expired.</p>
        </div>
      </div>
    );
  }

  if (status === 'error' || !trip) {
    return (
      <div className="gt-public gt-public--center">
        <GlobalPublicPageStyles />
        <div className="gt-public__revoked">
          <p className="gt-public__revoked-title">Couldn&apos;t load this trip</p>
          <p className="gt-public__revoked-sub">Check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const hue = hueFromString(trip.name || trip.id);
  const cities = (trip.cities || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="gt-public">
      <GlobalPublicPageStyles />

      {currentUser && (
        <div className="gt-public__minibar">
          <button type="button" className="gt-public__minibar-link" onClick={() => navigate && navigate('/dashboard')}>
            ← Dashboard
          </button>
          <span className="gt-public__minibar-avatar" aria-hidden="true">
            {(currentUser.name || '?').slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      <div
        className="gt-public__hero"
        style={
          trip.coverPhotoUrl
            ? { backgroundImage: `url(${trip.coverPhotoUrl})` }
            : { background: `linear-gradient(135deg, hsl(${hue},55%,42%), hsl(${(hue + 40) % 360},55%,58%))` }
        }
      >
        <div className="gt-public__hero-overlay">
          <h1 className="gt-public__title">{trip.name}</h1>
          <p className="gt-public__summary">
            {cities.length} {cities.length === 1 ? 'city' : 'cities'} · {dayCount} days · $
            {budget.total.toLocaleString()} est.
          </p>
        </div>
      </div>

      <div className="gt-public__chips" aria-label="Cities in this trip">
        {cities.map((c) => (
          <span key={c.id} className="gt-public__chip">
            <span className="gt-public__chip-dot" style={{ background: cityColorMap.get(c.id) }} />
            {c.name}
          </span>
        ))}
      </div>

      <div className="gt-public__timeline">
        {cities.map((city) => (
          <section key={city.id} className="gt-public__city-block">
            <h2 className="gt-public__city-heading" style={{ color: cityColorMap.get(city.id) }}>
              {city.name}
              {city.startDate && city.endDate && (
                <span className="gt-public__city-dates"> · {formatDateRange(city.startDate, city.endDate)}</span>
              )}
            </h2>
            {(city.days || []).map((day) =>
              DaySectionComponent ? (
                <DaySectionComponent key={day.id} day={day} city={city} readOnly getCategoryColor={getCategoryColor} />
              ) : (
                <FallbackReadOnlyDay key={day.id} day={day} cityColor={cityColorMap.get(city.id)} />
              )
            )}
          </section>
        ))}
      </div>

      <div className="gt-public__budget">
        <h2 className="gt-public__budget-heading">Budget summary</h2>
        <div className="gt-public__budget-total">${budget.total.toLocaleString()} total</div>
        <div className="gt-public__budget-bar" role="img" aria-label="Cost breakdown by category">
          {Object.entries(budget.byCategory).map(([cat, amount]) => (
            <span
              key={cat}
              className="gt-public__budget-segment"
              style={{ width: `${budget.total ? (amount / budget.total) * 100 : 0}%`, background: getCategoryColor(cat) }}
              title={`${cat}: $${amount.toLocaleString()}`}
            />
          ))}
        </div>
        <div className="gt-public__budget-legend">
          {Object.entries(budget.byCategory).map(([cat, amount]) => (
            <span key={cat} className="gt-public__budget-legend-item">
              <span className="gt-public__budget-legend-dot" style={{ background: getCategoryColor(cat) }} />
              {cat} · ${amount.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      <div className="gt-public__footer">
        <button type="button" className="gt-public__clone-btn" onClick={handleClone} disabled={isCloning}>
          {isCloning ? 'Cloning…' : 'Clone this trip'}
        </button>
        <div className="gt-public__share-icons">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my trip: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Share on X
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent('Check out this trip')}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          >
            Email
          </a>
        </div>
        <p className="gt-public__attribution">Planned with GlobeTrotter</p>
      </div>
    </div>
  );
}

function GlobalPublicPageStyles() {
  return (
    <style>{`
      .gt-public {
        --gt-bg-canvas: #FBFAF7; --gt-surface: #FFFFFF; --gt-border: #E4E0D6;
        --gt-text-primary: #1C1B18; --gt-text-secondary: #5B594F; --gt-text-muted: #8B8879;
        --gt-primary: #0E6E5C; --gt-primary-hover: #0A5548;
        font-family: Inter, system-ui, sans-serif; color: var(--gt-text-primary);
        background: var(--gt-bg-canvas); max-width: 760px; margin: 0 auto; padding-bottom: 64px;
      }
      .gt-public--center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; padding: 24px; }
      .gt-public__minibar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; }
      .gt-public__minibar-link { border: none; background: none; color: var(--gt-text-secondary); font-size: 13px; cursor: pointer; }
      .gt-public__minibar-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gt-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }

      .gt-public__hero { height: 240px; background-size: cover; background-position: center; border-radius: 0 0 16px 16px; display: flex; align-items: flex-end; }
      .gt-public__hero-overlay { width: 100%; padding: 20px 24px; background: linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0)); border-radius: 0 0 16px 16px; }
      .gt-public__title { font-family: Fraunces, Georgia, serif; font-size: 28px; color: #fff; margin: 0; }
      .gt-public__summary { color: rgba(255,255,255,0.9); font-size: 14px; margin: 4px 0 0; }

      .gt-public__chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 24px; }
      .gt-public__chip { display: inline-flex; align-items: center; gap: 6px; background: var(--gt-surface); border: 1px solid var(--gt-border); border-radius: 999px; padding: 4px 12px; font-size: 12px; }
      .gt-public__chip-dot { width: 7px; height: 7px; border-radius: 50%; }

      .gt-public__timeline { padding: 0 24px; }
      .gt-public__city-block { margin-bottom: 28px; }
      .gt-public__city-heading { font-size: 17px; font-weight: 600; margin: 0 0 10px; }
      .gt-public__city-dates { font-size: 12px; color: var(--gt-text-secondary); font-weight: 400; }

      .gt-public__day { background: var(--gt-surface); border: 1px solid var(--gt-border); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; }
      .gt-public__day-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
      .gt-public__day-bar { width: 3px; height: 16px; border-radius: 2px; }
      .gt-public__day-title { font-weight: 600; font-size: 13px; flex: 1; }
      .gt-public__day-cost { font-size: 12px; color: var(--gt-text-secondary); }
      .gt-public__day-empty { font-size: 12px; color: var(--gt-text-muted); }
      .gt-public__activity-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; }
      .gt-public__activity-bar { width: 3px; align-self: stretch; border-radius: 2px; }
      .gt-public__activity-time { color: var(--gt-text-secondary); width: 56px; flex-shrink: 0; }
      .gt-public__activity-name { flex: 1; }
      .gt-public__activity-location { color: var(--gt-text-muted); font-size: 12px; }
      .gt-public__activity-cost { color: var(--gt-text-secondary); font-size: 12px; }

      .gt-public__budget { padding: 8px 24px 24px; }
      .gt-public__budget-heading { font-size: 16px; font-weight: 600; margin: 0 0 6px; }
      .gt-public__budget-total { font-size: 22px; font-weight: 600; margin-bottom: 10px; }
      .gt-public__budget-bar { display: flex; width: 100%; height: 10px; border-radius: 999px; overflow: hidden; background: var(--gt-border); }
      .gt-public__budget-segment { display: inline-block; height: 100%; }
      .gt-public__budget-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
      .gt-public__budget-legend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--gt-text-secondary); text-transform: capitalize; }
      .gt-public__budget-legend-dot { width: 7px; height: 7px; border-radius: 50%; }

      .gt-public__footer { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 24px 0; text-align: center; }
      .gt-public__clone-btn { border: none; background: var(--gt-primary); color: #fff; font-weight: 600; font-size: 14px; padding: 10px 24px; border-radius: 8px; cursor: pointer; }
      .gt-public__clone-btn:hover { background: var(--gt-primary-hover); }
      .gt-public__clone-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .gt-public__share-icons { display: flex; gap: 14px; font-size: 13px; }
      .gt-public__share-icons a { color: var(--gt-primary); text-decoration: none; font-weight: 600; }
      .gt-public__attribution { font-size: 11px; color: var(--gt-text-muted); margin-top: 4px; }

      .gt-public__skeleton-hero { width: 100%; max-width: 600px; height: 200px; border-radius: 16px; background: var(--gt-border); animation: gt-public-pulse 1.4s ease-in-out infinite; }
      .gt-public__skeleton-line { width: 80%; max-width: 400px; height: 14px; border-radius: 6px; background: var(--gt-border); margin-top: 14px; animation: gt-public-pulse 1.4s ease-in-out infinite; }
      @keyframes gt-public-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      .gt-public__revoked { text-align: center; }
      .gt-public__revoked-title { font-weight: 600; font-size: 17px; margin: 0 0 6px; }
      .gt-public__revoked-sub { font-size: 13px; color: var(--gt-text-secondary); }

      @media (prefers-reduced-motion: reduce) {
        .gt-public__skeleton-hero, .gt-public__skeleton-line { animation: none; }
      }
      @media (max-width: 480px) {
        .gt-public__hero { height: 180px; }
        .gt-public__title { font-size: 22px; }
      }
    `}</style>
  );
}
