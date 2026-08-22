import React from 'react';

interface DashboardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  message = 'Failed to load your trips. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="my-8 rounded-xl border border-[#F8D7DA] bg-[#FDF2F2] p-6 sm:p-8 text-center"
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-[#FCE8E6] text-[#C43D3D] flex items-center justify-center mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="10" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3 className="text-base font-semibold text-[#C43D3D]">
        Unable to load dashboard
      </h3>
      <p className="text-xs sm:text-sm text-[#5B594F] mt-1 max-w-md mx-auto">
        {message}
      </p>

      {onRetry && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#C43D3D] hover:bg-[#A82B2B] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C43D3D]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
