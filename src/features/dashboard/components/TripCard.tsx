import React, { useState } from 'react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onSelectTrip?: (tripId: string) => void;
  onShareTrip?: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onSelectTrip,
  onShareTrip,
  onDeleteTrip,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const isOverBudget = trip.budget.status === 'over';
  const budgetColorClass = isOverBudget
    ? 'bg-[#FDF2F2] text-[#C43D3D] border-[#F8D7DA]'
    : 'bg-[#E1F1EC] text-[#0E6E5C] border-[#BCE1D6]';
  const dotColorClass = isOverBudget ? 'bg-[#C43D3D]' : 'bg-[#1E8E5A]';

  // Fallback gradient based on trip title characters
  const gradientClass =
    trip.status === 'past'
      ? 'from-[#5B594F] to-[#8B8879]'
      : trip.status === 'draft'
      ? 'from-[#2B5FA8] to-[#0E6E5C]'
      : 'from-[#0E6E5C] to-[#E8763C]';

  const visibleCities = trip.cityStops.slice(0, 3);
  const remainingCount = trip.cityStops.length - visibleCities.length;

  return (
    <article
      onClick={() => onSelectTrip?.(trip.id)}
      className="group relative flex flex-col rounded-xl border border-[#E4E0D6] bg-white shadow-sm hover:shadow-md hover:border-[#0E6E5C]/40 transition-all overflow-hidden cursor-pointer"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectTrip?.(trip.id);
        }
      }}
      aria-label={`Trip: ${trip.title}`}
    >
      {/* Card Media Header */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-tr bg-cover bg-center">
        {trip.coverPhotoUrl ? (
          <img
            src={trip.coverPhotoUrl}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-tr ${gradientClass} flex items-center justify-center`}
          >
            <span className="text-white/70 font-semibold tracking-wider text-sm uppercase">
              {trip.cityStops[0]?.cityName || 'Trip'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Status badges overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {trip.status === 'draft' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm">
              Draft
            </span>
          )}
          {trip.isPublic && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#0E6E5C]/90 text-white backdrop-blur-sm">
              Public
            </span>
          )}
          {trip.status === 'past' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#5B594F]/80 text-white backdrop-blur-sm">
              Past Trip
            </span>
          )}
        </div>

        {/* Overflow Menu trigger */}
        <div
          className="absolute top-2.5 right-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Trip actions menu"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 rounded-lg bg-white border border-[#E4E0D6] shadow-lg py-1 z-20 text-xs">
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[#1C1B18] hover:bg-[#F3F1EB] flex items-center gap-2"
                onClick={() => {
                  setShowMenu(false);
                  onShareTrip?.(trip.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-[#5B594F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-[#C43D3D] hover:bg-[#FDF2F2] flex items-center gap-2"
                onClick={() => {
                  setShowMenu(false);
                  onDeleteTrip?.(trip.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-[#C43D3D]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-[#1C1B18] text-base group-hover:text-[#0E6E5C] transition-colors line-clamp-1">
            {trip.title}
          </h3>

          <p className="text-xs text-[#5B594F] mt-1 flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-[#8B8879]"
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
            {trip.startDate} — {trip.endDate}
          </p>

          {/* City Chips Row */}
          <div className="mt-3 flex flex-wrap items-center gap-1">
            {visibleCities.map((stop) => (
              <span
                key={stop.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F1EB] text-[#5B594F] border border-[#E4E0D6]"
              >
                {stop.cityName}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#F3F1EB] text-[#8B8879]">
                +{remainingCount} more
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Budget Pill */}
        <div className="mt-4 pt-3 border-t border-[#E4E0D6] flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${budgetColorClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
            {trip.budget.currency || '$'}
            {trip.budget.totalEstimated.toLocaleString()} est.
          </span>

          <span className="text-[11px] text-[#8B8879] group-hover:text-[#0E6E5C] font-medium flex items-center gap-0.5">
            View
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
};
