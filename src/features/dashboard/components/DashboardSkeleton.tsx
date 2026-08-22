import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-8" aria-label="Loading dashboard...">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#E4E0D6] rounded-md" />
          <div className="h-4 w-64 bg-[#F3F1EB] rounded-md" />
        </div>
        <div className="h-10 w-36 bg-[#E4E0D6] rounded-lg" />
      </div>

      {/* Spotlight Card Skeleton */}
      <div className="rounded-xl border border-[#E4E0D6] bg-white overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[220px]">
          <div className="md:col-span-5 h-48 md:h-auto bg-[#F3F1EB]" />
          <div className="p-6 md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-28 bg-[#F3F1EB] rounded-full" />
                <div className="h-5 w-24 bg-[#F3F1EB] rounded-full" />
              </div>
              <div className="h-7 w-3/4 bg-[#E4E0D6] rounded-md" />
              <div className="h-4 w-full bg-[#F3F1EB] rounded-md" />
              <div className="flex gap-2 pt-2">
                <div className="h-5 w-16 bg-[#F3F1EB] rounded-md" />
                <div className="h-5 w-16 bg-[#F3F1EB] rounded-md" />
                <div className="h-5 w-16 bg-[#F3F1EB] rounded-md" />
              </div>
            </div>
            <div className="pt-4 border-t border-[#E4E0D6] flex justify-between items-center">
              <div className="h-4 w-36 bg-[#F3F1EB] rounded-md" />
              <div className="h-9 w-32 bg-[#E4E0D6] rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Trip Grid Header & Toolbar Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="h-6 w-32 bg-[#E4E0D6] rounded-md" />
            <div className="h-3.5 w-48 bg-[#F3F1EB] rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-44 bg-[#F3F1EB] rounded-lg" />
            <div className="h-8 w-48 bg-[#F3F1EB] rounded-lg" />
          </div>
        </div>

        {/* 3-Card Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[#E4E0D6] bg-white overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-[#F3F1EB]" />
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-4/5 bg-[#E4E0D6] rounded-md" />
                  <div className="h-3.5 w-32 bg-[#F3F1EB] rounded-md" />
                  <div className="flex gap-1.5 pt-1">
                    <div className="h-4 w-12 bg-[#F3F1EB] rounded" />
                    <div className="h-4 w-12 bg-[#F3F1EB] rounded" />
                  </div>
                </div>
                <div className="pt-3 border-t border-[#E4E0D6] flex justify-between items-center">
                  <div className="h-4 w-20 bg-[#F3F1EB] rounded-full" />
                  <div className="h-3 w-10 bg-[#F3F1EB] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Get Inspired Rail Skeleton */}
      <div className="space-y-3 pt-4">
        <div className="h-5 w-28 bg-[#E4E0D6] rounded-md" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-64 flex-shrink-0 rounded-xl border border-[#E4E0D6] bg-white overflow-hidden"
            >
              <div className="h-36 bg-[#F3F1EB]" />
              <div className="p-3.5 space-y-2">
                <div className="h-3 w-full bg-[#F3F1EB] rounded" />
                <div className="h-3 w-3/4 bg-[#F3F1EB] rounded" />
                <div className="h-7 w-full bg-[#E4E0D6] rounded-lg mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
