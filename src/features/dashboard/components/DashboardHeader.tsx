import React from 'react';

interface DashboardHeaderProps {
  userName?: string;
  upcomingCount: number;
  onPlanNewTrip?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = 'Alex',
  upcomingCount,
  onPlanNewTrip,
}) => {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1B18] font-serif">
          Welcome back, {userName}
        </h1>
        <p className="text-sm text-[#5B594F] mt-1">
          {upcomingCount > 0
            ? `You have ${upcomingCount} upcoming trip${upcomingCount > 1 ? 's' : ''} on your radar.`
            : 'Ready to plan your next journey?'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPlanNewTrip}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0E6E5C] hover:bg-[#0A5548] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0E6E5C] focus:ring-offset-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Plan New Trip
        </button>
      </div>
    </header>
  );
};
