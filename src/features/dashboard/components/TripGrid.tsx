import React from 'react';
import type { Trip, DashboardFilter } from '../types';
import { TripCard } from './TripCard';

interface TripGridProps {
  trips: Trip[];
  filter: DashboardFilter;
  onFilterChange: (filter: DashboardFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTrip?: (tripId: string) => void;
  onShareTrip?: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
}

export const TripGrid: React.FC<TripGridProps> = ({
  trips,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onSelectTrip,
  onShareTrip,
  onDeleteTrip,
}) => {
  const filterTabs: { id: DashboardFilter; label: string }[] = [
    { id: 'all', label: 'All Trips' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'draft', label: 'Drafts' },
    { id: 'past', label: 'Past' },
  ];

  return (
    <section aria-label="Your Trips" className="mb-8">
      {/* Header and Filter/Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#1C1B18] font-serif">
            Your Trips
          </h2>
          <p className="text-xs text-[#5B594F]">
            Manage, edit, and organize all your multi-city itineraries.
          </p>
        </div>

        {/* Toolbar: Filter Tabs + Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Filter Pills */}
          <div
            role="tablist"
            aria-label="Filter trips by status"
            className="inline-flex p-1 rounded-lg bg-[#F3F1EB] border border-[#E4E0D6] self-start sm:self-auto"
          >
            {filterTabs.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => onFilterChange(tab.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0E6E5C] shadow-xs font-semibold'
                      : 'text-[#5B594F] hover:text-[#1C1B18]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#8B8879]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search trips or cities…"
              className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-white border border-[#E4E0D6] text-[#1C1B18] placeholder-[#8B8879] focus:outline-none focus:ring-2 focus:ring-[#0E6E5C] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-[#8B8879] hover:text-[#1C1B18]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid or Filtered Empty State */}
      {trips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onSelectTrip={onSelectTrip}
              onShareTrip={onShareTrip}
              onDeleteTrip={onDeleteTrip}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E4E0D6] bg-[#FBFAF7] p-8 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#F3F1EB] flex items-center justify-center text-[#8B8879] mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#1C1B18]">
            No trips found
          </h3>
          <p className="text-xs text-[#5B594F] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No itineraries match "${searchQuery}" under ${filter} trips.`
              : `You don't have any ${filter === 'all' ? '' : filter} trips.`}
          </p>
          {(searchQuery || filter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onFilterChange('all');
              }}
              className="mt-3 inline-flex items-center text-xs font-medium text-[#0E6E5C] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </section>
  );
};
