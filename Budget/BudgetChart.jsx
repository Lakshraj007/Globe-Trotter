import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "./budgetCalculations";

function prefersReducedMotionNow() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * BudgetChart
 *
 * Generic pie/bar chart for budget data. Knows nothing about trips,
 * itineraries, or where its data came from — callers (BudgetTab,
 * BudgetSnapshotWidget, etc.) pass shaped data in and this just draws it.
 *
 * PIE mode:
 *   data: [{ name, value, category }]   // category maps to CATEGORY_COLORS
 *   centerLabel: string                  // optional text in the donut hole
 *
 * BAR mode:
 *   data: [{ [xKey]: ..., [yKey]: number, [highlightKey]?: boolean }]
 *   xKey / yKey: field names to plot
 *   highlightKey: boolean field — true bars render in `highlightColor`
 *   formatXTick: (value) => string       // optional axis label formatter
 *
 * `compact` shrinks padding/font size and hides axes/tooltips for
 * sidebar-widget use (BudgetSnapshotWidget).
 */
export default function BudgetChart({
  type = "pie",
  data = [],
  height = 220,
  centerLabel,
  xKey = "date",
  yKey = "total",
  highlightKey,
  highlightColor = "#E11D48",
  baseColor = "#0D9488",
  formatXTick,
  compact = false,
}) {
  const animate = !prefersReducedMotionNow();

  if (type === "pie") {
    return (
      <div className="relative w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={compact ? "55%" : 62}
              outerRadius={compact ? "80%" : 95}
              paddingAngle={compact ? 2 : 3}
              isAnimationActive={animate}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category || entry.name}
                  fill={CATEGORY_COLORS[entry.category] || baseColor}
                  stroke="none"
                />
              ))}
            </Pie>
            {!compact && <Tooltip formatter={(value) => formatCurrency(value)} />}
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {!compact && <span className="text-xs text-slate-400">Total</span>}
            <span className={compact ? "text-sm font-bold text-slate-900" : "text-lg font-bold text-slate-900"}>
              {centerLabel}
            </span>
          </div>
        )}
      </div>
    );
  }

  // bar
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={compact ? { top: 4, right: 0, bottom: 0, left: 0 } : undefined}>
          {!compact && (
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: "#64748B" }}
              tickFormatter={formatXTick}
            />
          )}
          {!compact && <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />}
          {!compact && (
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelFormatter={formatXTick}
              cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
            />
          )}
          <Bar
            dataKey={yKey}
            radius={compact ? [3, 3, 0, 0] : [6, 6, 0, 0]}
            isAnimationActive={animate}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry[xKey] ?? i}
                fill={highlightKey && entry[highlightKey] ? highlightColor : baseColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
