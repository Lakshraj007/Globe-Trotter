import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { Trip, Destination } from './types';
import { MOCK_TRIPS, MOCK_DESTINATIONS } from './mockData';

type PreviewMode = 'normal' | 'loading' | 'error' | 'empty';

/**
 * Development-only Preview Harness for Person C Dashboard.
 * Lives entirely inside src/features/dashboard/.
 * Allows toggling and testing all 4 dashboard states (Normal, Loading, Error, Empty) interactively.
 */
export const DashboardPreview: React.FC = () => {
  const [mode, setMode] = useState<PreviewMode>('normal');
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [logMessage, setLogMessage] = useState<string | null>(null);

  const showToast = (action: string) => {
    setLogMessage(`Action triggered: ${action}`);
    setTimeout(() => setLogMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7]">
      {/* Interactive Dev Switcher Toolbar */}
      <aside
        aria-label="Development Preview Controls"
        className="sticky top-0 z-50 bg-[#1C1B18] text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#0E6E5C] text-white">
            Person C Dev Preview
          </span>
          <span className="text-[#8B8879] hidden sm:inline">
            Test Dashboard States:
          </span>
        </div>

        {/* State Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-[#2B2A27] p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('normal')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              mode === 'normal'
                ? 'bg-[#0E6E5C] text-white shadow-xs'
                : 'text-[#8B8879] hover:text-white'
            }`}
          >
            Populated (4 Trips)
          </button>
          <button
            type="button"
            onClick={() => setMode('loading')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              mode === 'loading'
                ? 'bg-[#0E6E5C] text-white shadow-xs'
                : 'text-[#8B8879] hover:text-white'
            }`}
          >
            Loading Skeleton
          </button>
          <button
            type="button"
            onClick={() => setMode('error')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              mode === 'error'
                ? 'bg-[#C43D3D] text-white shadow-xs'
                : 'text-[#8B8879] hover:text-white'
            }`}
          >
            Error State
          </button>
          <button
            type="button"
            onClick={() => setMode('empty')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              mode === 'empty'
                ? 'bg-[#E8763C] text-white shadow-xs'
                : 'text-[#8B8879] hover:text-white'
            }`}
          >
            Empty (0 Trips)
          </button>
        </div>

        {/* Reset Trips Action */}
        <button
          type="button"
          onClick={() => {
            setTrips(MOCK_TRIPS);
            setMode('normal');
            showToast('Reset trips to initial mock data');
          }}
          className="text-[#8B8879] hover:text-white underline cursor-pointer text-[11px]"
        >
          Reset Data
        </button>
      </aside>

      {/* Ephemeral Feedback Toast */}
      {logMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1C1B18] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-[#5B594F]/40 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#1E8E5A]" />
          {logMessage}
        </div>
      )}

      {/* Main Dashboard Render with Active Dev State */}
      <Dashboard
        userName="Alex"
        initialTrips={mode === 'empty' ? [] : trips}
        initialDestinations={MOCK_DESTINATIONS}
        isLoading={mode === 'loading'}
        isError={mode === 'error'}
        errorMessage="Could not connect to the trip planning service. Check your network connection."
        onRetry={() => {
          showToast('Retrying fetch...');
          setMode('normal');
        }}
        onPlanNewTrip={() => showToast('Clicked "+ Plan New Trip" CTA')}
        onSelectTrip={(id) => showToast(`Selected Trip ID: "${id}"`)}
        onShareTrip={(id) => showToast(`Triggered Share for Trip ID: "${id}"`)}
        onDeleteTrip={(id) => {
          setTrips((prev) => prev.filter((t) => t.id !== id));
          showToast(`Deleted Trip ID: "${id}"`);
        }}
        onAddDestination={(dest: Destination) =>
          showToast(`Added "${dest.cityName}" to plan`)
        }
        onViewBudgetBreakdown={() =>
          showToast('Clicked "View detailed budget breakdown"')
        }
      />
    </div>
  );
};
