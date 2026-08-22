import React from 'react';
import type { DashboardStats } from '../types';

interface BudgetHighlightsCardProps {
  stats: DashboardStats;
  onViewBudgetBreakdown?: () => void;
}

export const BudgetHighlightsCard: React.FC<BudgetHighlightsCardProps> = ({
  stats,
  onViewBudgetBreakdown,
}) => {
  return (
    <aside
      aria-label="Budget Highlights"
      className="rounded-xl border border-[#E4E0D6] bg-white p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1C1B18] font-serif flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-[#0E6E5C]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Budget Overview
        </h3>
        <span className="text-[11px] font-medium text-[#8B8879]">Upcoming</span>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-[#FBFAF7] border border-[#E4E0D6]/60">
          <p className="text-xs text-[#5B594F]">Total Planned Spend</p>
          <p className="text-xl font-bold text-[#1C1B18] mt-0.5">
            ${stats.totalEstimatedCost.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#8B8879] mt-0.5">
            Across {stats.upcomingCount} upcoming trip{stats.upcomingCount > 1 ? 's' : ''}
          </p>
        </div>

        {stats.overBudgetCount > 0 ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FDF2F2] border border-[#F8D7DA] text-xs text-[#C43D3D]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              <strong>{stats.overBudgetCount}</strong> trip is currently exceeding estimated budget.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#E1F1EC] border border-[#BCE1D6] text-xs text-[#0E6E5C]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 flex-shrink-0 text-[#1E8E5A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>All upcoming trips are within budgeted caps.</span>
          </div>
        )}
      </div>

      {onViewBudgetBreakdown && (
        <button
          type="button"
          onClick={onViewBudgetBreakdown}
          className="w-full text-center text-xs font-medium text-[#0E6E5C] hover:text-[#0A5548] hover:underline cursor-pointer"
        >
          View detailed budget breakdown →
        </button>
      )}
    </aside>
  );
};
