import React from 'react';
import type { Trip } from '../types';

interface TripSpotlightCardProps {
  trip: Trip;
  onContinuePlanning?: (tripId: string) => void;
}

export const TripSpotlightCard: React.FC<TripSpotlightCardProps> = ({
  trip,
  onContinuePlanning,
}) => {
  const isOverBudget = trip.budget.status === 'over';
  const budgetColorClass = isOverBudget
    ? 'bg-[#FDF2F2] text-[#C43D3D] border-[#F8D7DA]'
    : 'bg-[#E1F1EC] text-[#0E6E5C] border-[#BCE1D6]';
  const dotColorClass = isOverBudget ? 'bg-[#C43D3D]' : 'bg-[#1E8E5A]';

  return (
    <section aria-label="Upcoming Trip Spotlight" className="mb-8">
      <div className="relative overflow-hidden rounded-xl border border-[#E4E0D6] bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[220px]">
          {/* Cover Photo / Graphic Column */}
          <div className="relative md:col-span-5 lg:col-span-5 h-48 md:h-auto overflow-hidden bg-gradient-to-tr from-[#0E6E5C] to-[#2B5FA8]">
            {trip.coverPhotoUrl ? (
              <img
                src={trip.coverPhotoUrl}
                alt={trip.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 font-medium">
                GlobeTrotter
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
          </div>

          {/* Details Column */}
          <div className="p-5 sm:p-6 md:col-span-7 lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Badges row: Countdown & Budget Pill */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {trip.daysUntilDeparture !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FCEADD] text-[#E8763C]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {trip.daysUntilDeparture === 0
                      ? 'Departs today!'
                      : `Departs in ${trip.daysUntilDeparture} days`}
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${budgetColorClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${dotColorClass}`} />
                  {trip.budget.currency || '$'}
                  {trip.budget.totalEstimated.toLocaleString()} est.
                  {trip.budget.budgetCap && ` / ${trip.budget.currency || '$'}${trip.budget.budgetCap.toLocaleString()}`}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B18] tracking-tight">
                {trip.title}
              </h2>
              {trip.description && (
                <p className="text-xs sm:text-sm text-[#5B594F] mt-1 line-clamp-2">
                  {trip.description}
                </p>
              )}

              {/* City Stop Sequence Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-[#8B8879] mr-1">Route:</span>
                {trip.cityStops.map((stop, idx) => (
                  <React.Fragment key={stop.id}>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#F3F1EB] text-[#1C1B18] border border-[#E4E0D6]">
                      <span className="text-[#0E6E5C] font-semibold">{stop.orderIndex}.</span>
                      {stop.cityName}
                    </span>
                    {idx < trip.cityStops.length - 1 && (
                      <span className="text-[#8B8879] text-xs">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Dates & Action Row */}
            <div className="mt-6 pt-4 border-t border-[#E4E0D6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center text-xs text-[#5B594F] gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-[#8B8879]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  {trip.startDate} — {trip.endDate}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onContinuePlanning?.(trip.id)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-[#0E6E5C] hover:bg-[#0A5548] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0E6E5C] cursor-pointer"
              >
                Continue Planning
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
