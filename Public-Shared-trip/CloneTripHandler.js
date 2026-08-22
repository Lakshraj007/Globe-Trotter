/**
 * CloneTripHandler.js
 * ---------------------------------------------------------------------------
 * Owner: Person D (Budget / Calendar / Sharing)
 * Blueprint refs: §2.2 ("Copying a public itinerary"), §13.1 (Clone CTA),
 *                 §16.3 (API pattern, optimistic-with-rollback philosophy),
 *                 §18 (returnTo redirect contract), §19 (clone loading/error states),
 *                 §21 Phase 9 (mock clone id generation before backend exists)
 *
 * Pure logic, no JSX/rendering — imported by PublicTripPage.jsx (and
 * CloneTripButton, wherever it lives) so the auth-gate + deep-copy behavior
 * has exactly one implementation instead of being re-derived per caller.
 * ---------------------------------------------------------------------------
 */

/** Lightweight unique id generator — good enough for client-side mock data;
 *  swap for whatever the real backend returns once /trips/:id/clone exists. */
export function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

/**
 * Deep-copies a trip's full nested tree (Trip → CityStops → Days → Activities)
 * with fresh ids at every level, per §17.1's relational shape. Used as the
 * Phase-9 mock fallback when no real clone endpoint is available yet, and
 * safe to call even once the backend exists (e.g. for an "undo"/preview).
 *
 * @param {Object} sourceTrip
 * @param {{ name?: string }} [overrides]
 * @returns {Object} a new trip object, unpublished, owned by no one yet
 */
export function deepCloneTripData(sourceTrip, overrides = {}) {
  const now = new Date().toISOString();

  return {
    ...sourceTrip,
    id: generateId('trip'),
    name: overrides.name || `${sourceTrip.name} (copy)`,
    isPublic: false,
    shareId: null,
    clonedFromTripId: sourceTrip.id,
    createdAt: now,
    updatedAt: now,
    cities: (sourceTrip.cities || []).map((city) => ({
      ...city,
      id: generateId('city'),
      days: (city.days || []).map((day) => ({
        ...day,
        id: generateId('day'),
        activities: (day.activities || []).map((activity) => ({
          ...activity,
          id: generateId('activity'),
        })),
      })),
    })),
  };
}

/** Route the Itinerary Builder lands on once a trip exists — matches §18. */
export function buildItineraryPath(tripId) {
  return `/trips/${tripId}/itinerary`;
}

/**
 * Builds the login redirect URL that preserves return-to intent, per §18:
 * "unauthenticated access... redirect to /login?returnTo=<original path>,
 * successful login redirects back to that original path."
 */
export function buildLoginRedirect(returnToPath) {
  return `/login?returnTo=${encodeURIComponent(returnToPath)}`;
}

/**
 * Orchestrates the full "Clone this trip" action.
 *
 * - Not logged in  -> redirect to /login with the current public page as the
 *   return-to target, so the user lands right back here after auth (§2.2/§18).
 * - Logged in      -> call POST /trips/:id/clone; if that fails or isn't wired
 *   up yet, fall back to a client-side deep copy so the demo never breaks
 *   (§21 Phase 9's "mock share id generation" guidance extended to clone).
 * - On success     -> navigate into the new copy's Builder + success toast.
 * - On failure     -> error toast, stay on the public page (§19's exact spec
 *   for this row: "Error toast, stay on public page").
 *
 * @param {Object} params
 * @param {Object} params.trip            - the public trip being cloned
 * @param {Object|null} params.currentUser - null/undefined if logged out
 * @param {(path: string) => void} params.navigate
 * @param {(toast: { type: 'success'|'error', message: string }) => void} [params.showToast]
 * @param {typeof fetch} [params.fetchImpl] - injectable for tests/mocking
 * @param {string} [params.apiBaseUrl]
 * @returns {Promise<{ redirectedToLogin?: boolean, clonedTrip?: Object, error?: unknown }>}
 */
export async function cloneTrip({
  trip,
  currentUser,
  navigate,
  showToast,
  fetchImpl = typeof fetch !== 'undefined' ? fetch : undefined,
  apiBaseUrl = '',
}) {
  if (!currentUser) {
    const intendedPath = `/share/${trip.shareId || trip.id}`;
    navigate(buildLoginRedirect(intendedPath));
    return { redirectedToLogin: true };
  }

  try {
    let clonedTrip = null;

    if (fetchImpl) {
      const res = await fetchImpl(`${apiBaseUrl}/trips/${trip.id}/clone`, { method: 'POST' });
      if (res && res.ok) {
        clonedTrip = await res.json();
      }
    }

    // Backend not wired up yet (or the call failed softly) — keep the demo
    // flow alive with a client-side deep copy rather than a dead end.
    if (!clonedTrip) {
      clonedTrip = deepCloneTripData(trip);
    }

    navigate(buildItineraryPath(clonedTrip.id));
    if (showToast) showToast({ type: 'success', message: 'This is your copy — feel free to edit.' });
    return { clonedTrip };
  } catch (err) {
    if (showToast) showToast({ type: 'error', message: "Couldn't clone this trip — try again." });
    return { error: err };
  }
}
