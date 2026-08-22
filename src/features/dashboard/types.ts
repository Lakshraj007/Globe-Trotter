/**
 * Data contracts for Person C Dashboard.
 * Aligned with GlobeTrotter Blueprint §7, §16, and §17.
 * Designed for clean substitution when Person A / backend Trip schema is integrated.
 */

export interface CityStop {
  id: string;
  cityName: string;
  country: string;
  startDate?: string;
  endDate?: string;
  nights?: number;
  orderIndex: number;
  photoUrl?: string;
}

export type BudgetStatus = 'under' | 'near' | 'over';

export interface BudgetSummary {
  totalEstimated: number;
  budgetCap?: number;
  status: BudgetStatus;
  currency?: string;
}

export type TripStatus = 'upcoming' | 'past' | 'draft';

export interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  isPublic: boolean;
  coverPhotoUrl?: string;
  cityStops: CityStop[];
  budget: BudgetSummary;
  daysUntilDeparture?: number;
  updatedAt?: string;
}

export interface Destination {
  id: string;
  cityName: string;
  country: string;
  tagline: string;
  costIndex: 'Budget' | 'Mid-range' | 'Premium';
  photoUrl: string;
  popularCategories?: string[];
}

export type DashboardFilter = 'all' | 'upcoming' | 'past' | 'draft';

export interface DashboardStats {
  upcomingCount: number;
  totalEstimatedCost: number;
  overBudgetCount: number;
}
