import React, { useMemo, useState, useEffect, useRef, memo } from "react";
import { Wallet, TrendingDown, TrendingUp, AlertTriangle, MapPin, Sparkles } from "lucide-react";
import {
  getBudgetSummary,
  formatCurrency,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "./budgetCalculations";
import BudgetChart from "./BudgetChart";

/*
  Design notes:
  Palette — "Horizon" theme:
    Ink #0F172A text | Slate #64748B secondary | Horizon #0D9488 teal
    Sunset #F59E0B amber | Alert #E11D48 coral | Mist #F1F5F9 neutral

  Signature element: the "Budget Horizon" gauge — teal-to-amber gradient
  with a sliding marker, like a sun crossing a horizon line.

  This file owns layout, stats, and the gauge. Actual pie/bar rendering
  is delegated to BudgetChart.jsx (shared with BudgetSnapshotWidget) so
  chart logic exists in exactly one place.

  Perf notes:
  - `summary` is memoized on debounced inputs so typing doesn't thrash it.
  - Chart-ready arrays are memoized separately from `summary`.
  - StatCard / BudgetHorizon are React.memo'd — pure, prop-driven.
  - Reduced-motion handling lives inside BudgetChart, not here.
*/

/* ---------- hooks ---------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(value, duration = 700) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef();

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const to = value;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(from + (to - from) * easeOutCubic(t));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration, reducedMotion]);

  return display;
}

/* ---------- presentational pieces (memoized — pure/prop-driven) ---------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <Sparkles className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-700">No costs added yet</p>
      <p className="max-w-xs text-sm text-slate-500">
        Add activities in the Itinerary Builder and your budget will build itself here — live.
      </p>
    </div>
  );
}

const StatCard = memo(function StatCard({ icon: Icon, label, value, tone = "default", delay = 0 }) {
  const toneStyles = {
    default: "bg-white border-slate-200 text-slate-900",
    warning: "bg-rose-50 border-rose-200 text-rose-700",
    good: "bg-teal-50 border-teal-200 text-teal-700",
  }[tone];

  const iconToneStyles = {
    default: "bg-slate-100 text-slate-500",
    warning: "bg-rose-100 text-rose-600",
    good: "bg-teal-100 text-teal-600",
  }[tone];

  return (
    <div
      className={`budget-fade-up rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${toneStyles}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconToneStyles}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 text-xl font-bold leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
});

const BudgetHorizon = memo(function BudgetHorizon({ progress }) {
  if (!progress) return null;
  const { spent, budget, percent, isOverBudget, overBy } = progress;

  return (
    <div className="budget-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Budget horizon</h3>
          <p className="text-xs text-slate-500">
            {formatCurrency(spent)} of {formatCurrency(budget)} spent
          </p>
        </div>
        {isOverBudget ? (
          <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
            <AlertTriangle className="h-3 w-3" />
            {formatCurrency(overBy)} over
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-700">
            <TrendingUp className="h-3 w-3" />
            On track
          </span>
        )}
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="horizon-fill h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: isOverBudget
              ? "linear-gradient(90deg, #F59E0B 0%, #E11D48 100%)"
              : "linear-gradient(90deg, #0D9488 0%, #F59E0B 100%)",
          }}
        />
        <div
          className={`horizon-marker absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-md ${
            isOverBudget ? "bg-rose-500 horizon-pulse" : "bg-amber-400"
          }`}
          style={{ left: `calc(${percent}% - 10px)` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>$0</span>
        <span>{formatCurrency(budget)}</span>
      </div>
    </div>
  );
});

/* ---------- main component ---------- */

/**
 * BudgetTab
 *
 * Read-only, fully dynamic view over a trip's itinerary data. Owns no
 * server state — receives `trip` as a prop and re-derives everything via
 * the pure, cached functions in budgetCalculations.js. Chart rendering
 * is delegated to BudgetChart.jsx (shared with BudgetSnapshotWidget).
 *
 * Props:
 *   trip        - the trip object (required)
 *   dailyLimit  - optional number; days above this are flagged red on the bar chart
 *   tripBudget  - optional number; whole-trip cap, powers the Budget Horizon gauge
 */
export default function BudgetTab({ trip, dailyLimit, tripBudget }) {
  const [limitInput, setLimitInput] = useState(dailyLimit || "");
  const [budgetInput, setBudgetInput] = useState(tripBudget || "");

  const debouncedLimit = useDebouncedValue(limitInput, 300);
  const debouncedBudget = useDebouncedValue(budgetInput, 300);

  const effectiveLimit = Number(debouncedLimit) > 0 ? Number(debouncedLimit) : undefined;
  const effectiveBudget = Number(debouncedBudget) > 0 ? Number(debouncedBudget) : undefined;

  const summary = useMemo(
    () => getBudgetSummary(trip, effectiveLimit, effectiveBudget),
    [trip, effectiveLimit, effectiveBudget]
  );

  const hasActivities = summary.total > 0;

  const animatedTotal = useCountUp(summary.total);
  const animatedAverage = useCountUp(summary.averagePerDay);

  // pieData + precomputed percentages, so the legend doesn't recompute
  // entry.value / summary.total on every render pass through .map()
  const pieData = useMemo(() => {
    return Object.entries(summary.breakdown)
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({
        name: CATEGORY_LABELS[category],
        value,
        category,
        pct: summary.total ? Math.round((value / summary.total) * 100) : 0,
      }));
  }, [summary.breakdown, summary.total]);

  const barData = useMemo(() => {
    const overBudgetDates = new Set(summary.overBudgetDays.map((d) => d.date));
    return summary.perDay.map((d) => ({ ...d, isOverBudget: overBudgetDates.has(d.date) }));
  }, [summary.perDay, summary.overBudgetDays]);

  const perCityWithPct = useMemo(
    () =>
      summary.perCity.map((c) => ({
        ...c,
        pct: summary.total ? Math.round((c.total / summary.total) * 100) : 0,
      })),
    [summary.perCity, summary.total]
  );

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <style>{`
        @keyframes budgetFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .budget-fade-up { animation: budgetFadeUp 0.5s ease-out both; }
        .horizon-fill { transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .horizon-marker { transition: left 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes horizonPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.5); }
          50% { box-shadow: 0 0 0 6px rgba(225, 29, 72, 0); }
        }
        .horizon-pulse { animation: horizonPulse 1.6s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .budget-fade-up, .horizon-fill, .horizon-marker, .horizon-pulse {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Budget</h2>
          <p className="text-sm text-slate-500">Live costs across your whole trip.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Trip budget
            <input
              type="number"
              min="0"
              placeholder="e.g. 2000"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Daily limit
            <input
              type="number"
              min="0"
              placeholder="e.g. 150"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </label>
        </div>
      </div>

      {!hasActivities ? (
        <EmptyState />
      ) : (
        <>
          <BudgetHorizon progress={summary.tripProgress} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={Wallet} label="Total cost" value={formatCurrency(animatedTotal)} delay={0} />
            <StatCard icon={TrendingDown} label="Average / day" value={formatCurrency(animatedAverage)} delay={80} />
            <StatCard
              icon={AlertTriangle}
              label="Days over budget"
              value={summary.overBudgetDays.length}
              tone={summary.overBudgetDays.length > 0 ? "warning" : "good"}
              delay={160}
            />
          </div>

          <div className="budget-fade-up rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Breakdown by category</h3>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="w-56 shrink-0">
                <BudgetChart type="pie" data={pieData} height={224} centerLabel={formatCurrency(summary.total)} />
              </div>

              <div className="w-full space-y-2">
                {pieData.map((entry) => (
                  <div key={entry.category} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                    />
                    <span className="w-24 text-sm text-slate-600">{entry.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="horizon-fill h-full rounded-full"
                        style={{ width: `${entry.pct}%`, backgroundColor: CATEGORY_COLORS[entry.category] }}
                      />
                    </div>
                    <span className="w-14 text-right text-sm font-medium text-slate-700">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="budget-fade-up rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Cost per day</h3>
              {effectiveLimit && (
                <span className="text-xs text-slate-500">Limit: {formatCurrency(effectiveLimit)}/day</span>
              )}
            </div>
            <BudgetChart
              type="bar"
              data={barData}
              height={256}
              xKey="date"
              yKey="total"
              highlightKey="isOverBudget"
              highlightColor="#E11D48"
              baseColor="#0D9488"
              formatXTick={(d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            />
            {summary.overBudgetDays.length > 0 && (
              <p className="mt-2 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle className="h-3 w-3" />
                {summary.overBudgetDays.length} day{summary.overBudgetDays.length > 1 ? "s" : ""} over your daily limit (shown in coral).
              </p>
            )}
          </div>

          <div className="budget-fade-up rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Cost per city</h3>
            <ul className="divide-y divide-slate-100">
              {perCityWithPct.map((c) => (
                <li key={c.city} className="flex items-center gap-3 py-2.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="w-28 truncate text-sm text-slate-700">{c.city}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="horizon-fill h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-semibold text-slate-900">
                    {formatCurrency(c.total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}