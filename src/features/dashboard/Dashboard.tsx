import React, { useState, useMemo } from 'react';
import type { Trip, Destination, DashboardFilter, DashboardStats } from './types';
import { MOCK_TRIPS, MOCK_DESTINATIONS } from './mockData';
import { DashboardHeader } from './components/DashboardHeader';
import { TripSpotlightCard } from './components/TripSpotlightCard';
import { TripGrid } from './components/TripGrid';
import { GetInspiredRail } from './components/GetInspiredRail';
import { DashboardEmptyState } from './components/DashboardEmptyState';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { DashboardErrorState } from './components/DashboardErrorState';
import { BudgetHighlightsCard } from './components/BudgetHighlightsCard';

export interface DashboardProps {
  userName?: string;
  initialTrips?: Trip[];
  initialDestinations?: Destination[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onPlanNewTrip?: () => void;
  onSelectTrip?: (tripId: string) => void;
  onShareTrip?: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
  onAddDestination?: (destination: Destination) => void;
  onViewBudgetBreakdown?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userName = 'Alex',
  initialTrips = MOCK_TRIPS,
  initialDestinations = MOCK_DESTINATIONS,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onPlanNewTrip,
  onSelectTrip,
  onShareTrip,
  onDeleteTrip,
  onAddDestination,
  onViewBudgetBreakdown,
}) => {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [filter, setFilter] = useState<DashboardFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle local trip deletion if not controlled externally
  const handleDeleteTrip = (tripId: string) => {
    if (onDeleteTrip) {
      onDeleteTrip(tripId);
    } else {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    }
  };

  // Compute upcoming spotlight trip (first upcoming trip)
  const spotlightTrip = useMemo(() => {
    return trips.find(
      (t) =>
        t.status === 'upcoming' &&
        t.daysUntilDeparture !== undefined &&
        t.daysUntilDeparture <= 60
    );
  }, [trips]);

  // Filter & search trips
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // 1. Status Filter
      if (filter !== 'all' && trip.status !== filter) {
        return false;
      }

      // 2. Search Query (matches trip title, description, or city names)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = trip.title.toLowerCase().includes(query);
        const matchesDesc = trip.description?.toLowerCase().includes(query);
        const matchesCity = trip.cityStops.some((stop) =>
          stop.cityName.toLowerCase().includes(query) ||
          stop.country.toLowerCase().includes(query)
        );
        return matchesTitle || matchesDesc || matchesCity;
      }

      return true;
    });
  }, [trips, filter, searchQuery]);

  // Compute summary stats for header & budget highlight card
  const stats: DashboardStats = useMemo(() => {
    const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
    const totalEstimatedCost = upcomingTrips.reduce(
      (sum, t) => sum + t.budget.totalEstimated,
      0
    );
    const overBudgetCount = upcomingTrips.filter(
      (t) => t.budget.status === 'over'
    ).length;

    return {
      upcomingCount: upcomingTrips.length,
      totalEstimatedCost,
      overBudgetCount,
    };
  }, [trips]);

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardSkeleton />
      </main>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardErrorState message={errorMessage} onRetry={onRetry} />
      </main>
    );
  }

  // 3. User Zero-Trips Empty State
  if (trips.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader
          userName={userName}
          upcomingCount={0}
          onPlanNewTrip={onPlanNewTrip}
        />
        <DashboardEmptyState
          destinations={initialDestinations}
          onPlanFirstTrip={onPlanNewTrip}
          onAddDestination={onAddDestination}
        />
      </main>
    );
  }

  // 4. Populated Dashboard
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with "+ Plan New Trip" CTA */}
      <DashboardHeader
        userName={userName}
        upcomingCount={stats.upcomingCount}
        onPlanNewTrip={onPlanNewTrip}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Spotlight card shown when viewing all/upcoming and upcoming trip exists without active search */}
          {spotlightTrip && (filter === 'all' || filter === 'upcoming') && !searchQuery && (
            <TripSpotlightCard
              trip={spotlightTrip}
              onContinuePlanning={onSelectTrip}
            />
          )}

          {/* Your Trips Grid with Search & Status Filters */}
          <TripGrid
            trips={filteredTrips}
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectTrip={onSelectTrip}
            onShareTrip={onShareTrip}
            onDeleteTrip={handleDeleteTrip}
          />

          {/* Get Inspired Destination Recommendations */}
          <GetInspiredRail
            destinations={initialDestinations}
            onAddDestination={onAddDestination}
          />
        </div>

        {/* Desktop-only Right Rail: Ambient Budget Highlights (§7.4) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6">
          <BudgetHighlightsCard
            stats={stats}
            onViewBudgetBreakdown={onViewBudgetBreakdown}
          />
        </div>
      </div>
    </main>
  );
};
