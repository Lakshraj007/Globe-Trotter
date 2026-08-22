// budgetCalculations.js
// Pure, stateless functions — no React, no DOM. Consumed by BudgetTab,
// Person A's BudgetSnapshotWidget, and Person C's BudgetStatusPill.
//
// Expects Person A's itinerary data shape:
// trip = {
//   id, name, startDate, endDate,
//   stops: [
//     { id, city, arrivalDate, departureDate,
//       days: [
//         { date, activities: [{ id, name, category, cost }] }
//       ]
//     }
//   ]
// }
// category is one of: "transport" | "stay" | "activities" | "meals"

const CATEGORIES = ["transport", "stay", "activities", "meals"];

// Shared across BudgetTab, BudgetChart, BudgetSnapshotWidget, and
// BudgetStatusPill so category colors/labels and currency formatting
// can never drift between the four places budget data gets rendered.
export const CATEGORY_COLORS = {
  transport: "#0D9488", // horizon teal
  stay: "#6366F1", // indigo
  activities: "#F59E0B", // sunset amber
  meals: "#10B981", // emerald
};

export const CATEGORY_LABELS = {
  transport: "Transport",
  stay: "Stay",
  activities: "Activities",
  meals: "Meals",
};

export function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

// Caches the flattened activity list per `trip` object reference.
// Since trip updates produce a new object (immutable state pattern),
// stale entries are simply never looked up again and get garbage
// collected — no manual invalidation required.
const activitiesCache = new WeakMap();

/** Flattens every activity across every stop/day into a single array. */
export function getAllActivities(trip) {
  if (!trip?.stops) return [];
  if (activitiesCache.has(trip)) return activitiesCache.get(trip);

  const flattened = trip.stops.flatMap((stop) =>
    (stop.days || []).flatMap((day) =>
      (day.activities || []).map((activity) => ({
        ...activity,
        date: day.date,
        city: stop.city,
      }))
    )
  );

  activitiesCache.set(trip, flattened);
  return flattened;
}

/** Total cost across the whole trip. */
export function getTotalCost(trip) {
  return getAllActivities(trip).reduce((sum, a) => sum + (a.cost || 0), 0);
}

/** Breakdown by category, e.g. { transport: 120, stay: 400, activities: 80, meals: 60 } */
export function getCategoryBreakdown(trip) {
  const breakdown = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  for (const activity of getAllActivities(trip)) {
    const category = CATEGORIES.includes(activity.category) ? activity.category : "activities";
    breakdown[category] += activity.cost || 0;
  }
  return breakdown;
}

/** Cost per day: [{ date, total }], sorted chronologically. */
export function getCostPerDay(trip) {
  const perDay = {};
  for (const activity of getAllActivities(trip)) {
    perDay[activity.date] = (perDay[activity.date] || 0) + (activity.cost || 0);
  }
  return Object.entries(perDay)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** Cost per city: [{ city, total }]. */
export function getCostPerCity(trip) {
  const perCity = {};
  for (const activity of getAllActivities(trip)) {
    perCity[activity.city] = (perCity[activity.city] || 0) + (activity.cost || 0);
  }
  return Object.entries(perCity).map(([city, total]) => ({ city, total }));
}

/** Average cost per day (only counting days that have at least one activity). */
export function getAverageCostPerDay(trip) {
  const perDay = getCostPerDay(trip);
  if (perDay.length === 0) return 0;
  const total = perDay.reduce((sum, d) => sum + d.total, 0);
  return total / perDay.length;
}

/**
 * Days whose total exceeds dailyLimit.
 * dailyLimit is the per-day threshold (not the whole-trip budget).
 */
export function getOverBudgetDays(trip, dailyLimit) {
  if (!dailyLimit) return [];
  return getCostPerDay(trip).filter((d) => d.total > dailyLimit);
}

/**
 * Overall trip spend vs a whole-trip budget cap (distinct from the
 * per-day `dailyLimit` used by getOverBudgetDays).
 * Returns null if no tripBudget is set, so callers can skip the gauge cleanly.
 */
export function getTripBudgetProgress(trip, tripBudget, totalOverride) {
  if (!tripBudget || tripBudget <= 0) return null;
  const spent = totalOverride ?? getTotalCost(trip);
  const percent = Math.min((spent / tripBudget) * 100, 100);
  return {
    spent,
    budget: tripBudget,
    percent,
    remaining: Math.max(tripBudget - spent, 0),
    isOverBudget: spent > tripBudget,
    overBy: Math.max(spent - tripBudget, 0),
  };
}

/**
 * Convenience bundle — everything BudgetTab needs in ONE pass over the
 * activity list, instead of calling the five functions above separately
 * (which would each re-loop the same data independently).
 */
export function getBudgetSummary(trip, dailyLimit, tripBudget) {
  const activities = getAllActivities(trip);

  const breakdown = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  const perDayMap = new Map();
  const perCityMap = new Map();
  let total = 0;

  for (const activity of activities) {
    const cost = activity.cost || 0;
    total += cost;

    const category = CATEGORIES.includes(activity.category) ? activity.category : "activities";
    breakdown[category] += cost;

    perDayMap.set(activity.date, (perDayMap.get(activity.date) || 0) + cost);
    perCityMap.set(activity.city, (perCityMap.get(activity.city) || 0) + cost);
  }

  const perDay = Array.from(perDayMap, ([date, total]) => ({ date, total })).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const perCity = Array.from(perCityMap, ([city, total]) => ({ city, total }));

  const averagePerDay = perDay.length ? total / perDay.length : 0;
  const overBudgetDays = dailyLimit ? perDay.filter((d) => d.total > dailyLimit) : [];
  const tripProgress = getTripBudgetProgress(trip, tripBudget, total);

  return {
    total,
    breakdown,
    perDay,
    perCity,
    averagePerDay,
    overBudgetDays,
    tripProgress,
  };
}