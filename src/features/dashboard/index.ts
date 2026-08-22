/**
 * Public API for Person C's Dashboard feature module.
 * Exports the main Dashboard component, all modular sub-components, mock data, types, and dev preview.
 */

export { Dashboard } from './Dashboard';
export type { DashboardProps } from './Dashboard';
export { DashboardPreview } from './DashboardPreview';

// Sub-components
export { DashboardHeader } from './components/DashboardHeader';
export { TripSpotlightCard } from './components/TripSpotlightCard';
export { TripCard } from './components/TripCard';
export { TripGrid } from './components/TripGrid';
export { GetInspiredRail } from './components/GetInspiredRail';
export { DestinationCard } from './components/DestinationCard';
export { DashboardEmptyState } from './components/DashboardEmptyState';
export { DashboardSkeleton } from './components/DashboardSkeleton';
export { DashboardErrorState } from './components/DashboardErrorState';
export { BudgetHighlightsCard } from './components/BudgetHighlightsCard';

// Types
export type {
  Trip,
  CityStop,
  TripStatus,
  BudgetStatus,
  BudgetSummary,
  Destination,
  DashboardFilter,
  DashboardStats,
} from './types';

// Mock Data
export { MOCK_TRIPS, MOCK_DESTINATIONS } from './mockData';
