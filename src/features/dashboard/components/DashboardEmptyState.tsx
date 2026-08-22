import React from 'react';
import { Destination } from '../types';
import { GetInspiredRail } from './GetInspiredRail';

interface DashboardEmptyStateProps {
  destinations: Destination[];
  onPlanFirstTrip?: () => void;
  onAddDestination?: (destination: Destination) => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  destinations,
  onPlanFirstTrip,
  onAddDestination,
}) => {
  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Empty State Hero Card */}
      <div className="rounded-2xl border border-dashed border-[#E4E0D6] bg-white p-8 sm:p-12 text-center shadow-xs">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#E1F1EC] text-[#0E6E5C] flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B18] font-serif">
          Your next adventure starts here
        </h2>
        <p className="text-sm text-[#5B594F] mt-2 max-w-md mx-auto leading-relaxed">
          Plan seamless multi-city trips with automatic budgets and day-by-day
          timelines — all in one collaborative workspace.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={onPlanFirstTrip}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0E6E5C] hover:bg-[#0A5548] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0E6E5C] cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Plan Your First Trip
          </button>
        </div>
      </div>

      {/* Prominent Inspiration Rail underneath */}
      <GetInspiredRail
        destinations={destinations}
        onAddDestination={onAddDestination}
        title="Need Ideas? Start with a Destination"
        subtitle="Pick a popular city below to kickstart your first custom itinerary."
      />
    </div>
  );
};
