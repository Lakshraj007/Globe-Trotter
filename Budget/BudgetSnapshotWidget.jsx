import React, { useMemo } from "react";
import { Wallet, ChevronRight, AlertTriangle } from "lucide-react";
import { getBudgetSummary, formatCurrency, CATEGORY_COLORS, CATEGORY_LABELS } from "./budgetCalculations";
import BudgetChart from "./BudgetChart";

/**
 * BudgetSnapshotWidget
 *
 * Compact budget summary for Person A's Itinerary Builder sidebar.
 * Narrow footprint by design — this sits alongside the builder, not
 * in place of the full Budget tab, so it shows just enough to keep
 * spend visible while editing without competing for space.
 *
 * Props:
 *   trip        - the trip object (required)
 *   tripBudget  - optional whole-trip cap; powers the mini progress bar
 *   onViewFull  - optional callback, e.g. () => switchTab('budget')
 */
export default function BudgetSnapshotWidget({ trip, tripBudget, onViewFull }) {
  const summary = useMemo(() => getBudgetSummary(trip, undefined, tripBudget), [trip, tripBudget]);

  const hasActivities = summary.total > 0;
  const progress = summary.tripProgress;

  const pieData = useMemo(
    () =>
      Object.entries(summary.breakdown)
        .filter(([, value]) => value > 0)
        .map(([category, value]) => ({ name: CATEGORY_LABELS[category], value, category })),
    [summary.breakdown]
  );

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Wallet className="h-3.5 w-3.5" />
          Budget
        </div>
        {onViewFull && (
          <button
            type="button"
            onClick={onViewFull}
            className="flex items-center gap-0.5 text-xs font-medium text-teal-600 hover:text-teal-700"
          >
            Full view
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {!hasActivities ? (
        <p className="py-4 text-center text-xs text-slate-400">
          Add activities to see spend here.
        </p>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total)}</p>

          {progress && (
            <>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.percent}%`,
                    background: progress.isOverBudget
                      ? "linear-gradient(90deg, #F59E0B 0%, #E11D48 100%)"
                      : "linear-gradient(90deg, #0D9488 0%, #F59E0B 100%)",
                  }}
                />
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                {progress.isOverBudget ? (
                  <>
                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                    <span className="text-rose-600">{formatCurrency(progress.overBy)} over budget</span>
                  </>
                ) : (
                  <>{formatCurrency(progress.remaining)} left of {formatCurrency(progress.budget)}</>
                )}
              </p>
            </>
          )}

          {pieData.length > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <div className="w-16 shrink-0">
                <BudgetChart type="pie" data={pieData} height={64} compact />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                {pieData.slice(0, 3).map((entry) => (
                  <div key={entry.category} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                    />
                    <span className="truncate text-slate-500">{entry.name}</span>
                    <span className="ml-auto font-medium text-slate-700">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
