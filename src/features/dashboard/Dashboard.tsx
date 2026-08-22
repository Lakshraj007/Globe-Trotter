import React, { useMemo, useState } from 'react';
import {
  Trip,
  Destination,
  DashboardFilter,
  DashboardStats,
} from './types';

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
  userName = 'Heet',
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

  const handleDeleteTrip = (tripId: string) => {
    if (onDeleteTrip) {
      onDeleteTrip(tripId);
    } else {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    }
  };

  const spotlightTrip = useMemo(() => {
    return trips.find(
      (t) =>
        t.status === 'upcoming' &&
        t.daysUntilDeparture !== undefined &&
        t.daysUntilDeparture <= 60
    );
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (filter !== 'all' && trip.status !== filter) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();

        const matchesTitle = trip.title.toLowerCase().includes(query);

        const matchesDesc =
          trip.description?.toLowerCase().includes(query);

        const matchesCity = trip.cityStops.some(
          (stop) =>
            stop.cityName.toLowerCase().includes(query) ||
            stop.country.toLowerCase().includes(query)
        );

        return matchesTitle || matchesDesc || matchesCity;
      }

      return true;
    });
  }, [trips, filter, searchQuery]);

  const stats: DashboardStats = useMemo(() => {
    const upcomingTrips = trips.filter(
      (t) => t.status === 'upcoming'
    );

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

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <DashboardSkeleton />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <DashboardErrorState
            message={errorMessage}
            onRetry={onRetry}
          />
        </div>
      </main>
    );
  }

  if (trips.length === 0) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
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
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* HEADER */}

        <div className="dashboard-top">
          <div>
            <p className="dashboard-eyebrow">
              YOUR TRAVEL SPACE
            </p>

            <h1 className="dashboard-title">
              Welcome back, {userName}
            </h1>

            <p className="dashboard-subtitle">
              Plan your next adventure and keep every trip organized.
            </p>
          </div>

          <button
            className="dashboard-plan-button"
            onClick={onPlanNewTrip}
          >
            <span className="plus-icon">+</span>
            Plan New Trip
          </button>
        </div>

        {/* STATS */}

        <div className="dashboard-stats">

          <div className="stat-card">
            <div className="stat-icon">✈️</div>

            <div>
              <span>Upcoming Trips</span>
              <strong>{stats.upcomingCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>

            <div>
              <span>Estimated Budget</span>
              <strong>
                ₹{stats.totalEstimatedCost.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌍</div>

            <div>
              <span>Trips Planned</span>
              <strong>{trips.length}</strong>
            </div>
          </div>

        </div>

        {/* MAIN CONTENT */}

        <div className="dashboard-layout">

          <div className="dashboard-main">

            {/* FEATURED TRIP */}

            {spotlightTrip &&
              (filter === 'all' || filter === 'upcoming') &&
              !searchQuery && (
                <section className="featured-section">

                  <div className="section-heading">
                    <div>
                      <p className="section-label">
                        NEXT ADVENTURE
                      </p>

                      <h2>
                        Your upcoming trip
                      </h2>
                    </div>
                  </div>

                  <div className="spotlight-wrapper">
                    <TripSpotlightCard
                      trip={spotlightTrip}
                      onContinuePlanning={onSelectTrip}
                    />
                  </div>

                </section>
              )}

            {/* YOUR TRIPS */}

            <section className="trips-section">

              <div className="section-heading">
                <div>
                  <p className="section-label">
                    YOUR JOURNEYS
                  </p>

                  <h2>
                    Your Trips
                  </h2>
                </div>
              </div>

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

            </section>

            {/* INSPIRATION */}

            <section className="inspiration-section">

              <div className="section-heading">
                <div>
                  <p className="section-label">
                    GET INSPIRED
                  </p>

                  <h2>
                    Where will you go next?
                  </h2>
                </div>
              </div>

              <GetInspiredRail
                destinations={initialDestinations}
                onAddDestination={onAddDestination}
              />

            </section>

          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="dashboard-sidebar">

            <BudgetHighlightsCard
              stats={stats}
              onViewBudgetBreakdown={onViewBudgetBreakdown}
            />

            <div className="travel-tip-card">

              <div className="tip-icon">
                💡
              </div>

              <p className="tip-label">
                TRAVEL TIP
              </p>

              <h3>
                Plan experiences, not just destinations.
              </h3>

              <p>
                Add activities to your itinerary so your trip
                feels complete before you even leave.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
};

export default Dashboard;