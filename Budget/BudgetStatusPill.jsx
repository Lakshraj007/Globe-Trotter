import React, { useMemo } from "react";
import { Wallet, AlertTriangle } from "lucide-react";
import { getTotalCost, getTripBudgetProgress, formatCurrency } from "./budgetCalculations";

/**
 * BudgetStatusPill
 *
 * Smallest unit in the budget component family — a single-line badge
 * for Person C's trip cards on the Dashboard / My Trips screens.
 * No charts, no state, just: total spend, and a color if a budget
 * cap exists to compare against.
 *
 * Props:
 *   trip        - the trip object (required)
 *   tripBudget  - optional whole-trip cap; if provided, pill turns
 *                 amber/rose when spend approaches/exceeds it
 *   size        - "sm" (default, for tight card layouts) | "md"
 */
export default function BudgetStatusPill({ trip, tripBudget, size = "sm" }) {
  const total = useMemo(() => getTotalCost(trip), [trip]);
  const progress = useMemo(() => getTripBudgetProgress(trip, tripBudget, total), [trip, tripBudget, total]);

  const isOverBudget = progress?.isOverBudget;
  const isNearBudget = progress && !isOverBudget && progress.percent >= 85;

  const tone = isOverBudget ? "rose" : isNearBudget ? "amber" : "teal";

  const toneClasses = {
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  }[tone];

  const sizeClasses = size === "md" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${toneClasses} ${sizeClasses}`}
      title={
        progress
          ? `${formatCurrency(total)} of ${formatCurrency(progress.budget)} budget`
          : `${formatCurrency(total)} spent`
      }
    >
      {isOverBudget ? <AlertTriangle className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
      {formatCurrency(total)}
      {isOverBudget && <span className="hidden sm:inline">· over budget</span>}
    </span>
  );
}
