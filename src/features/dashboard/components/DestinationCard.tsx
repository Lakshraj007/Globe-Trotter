import React from 'react';
import type { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  onAddDestination?: (destination: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onAddDestination,
}) => {
  const costBadgeClass =
    destination.costIndex === 'Budget'
      ? 'bg-[#E1F1EC] text-[#0E6E5C] border-[#BCE1D6]'
      : destination.costIndex === 'Mid-range'
      ? 'bg-[#FEF3D6] text-[#C98A1E] border-[#FCE19C]'
      : 'bg-[#EBF2FC] text-[#2B5FA8] border-[#CCE0FA]';

  return (
    <div className="flex-shrink-0 w-64 sm:w-72 flex flex-col rounded-xl border border-[#E4E0D6] bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* City Photo */}
      <div className="relative h-36 w-full overflow-hidden bg-[#F3F1EB]">
        <img
          src={destination.photoUrl}
          alt={`${destination.cityName}, ${destination.country}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* City & Country Title over photo */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <h4 className="font-bold text-base leading-tight drop-shadow-sm font-serif">
            {destination.cityName}
          </h4>
          <p className="text-xs text-white/80">{destination.country}</p>
        </div>

        {/* Cost Index Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm shadow-xs ${costBadgeClass}`}
          >
            {destination.costIndex}
          </span>
        </div>
      </div>

      {/* Description & Action */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-[#5B594F] line-clamp-2 leading-relaxed">
            {destination.tagline}
          </p>

          {/* Categories tag chips */}
          {destination.popularCategories && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {destination.popularCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-[#F3F1EB] text-[#5B594F]"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddDestination?.(destination)}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-[#0E6E5C] bg-[#E1F1EC] hover:bg-[#D3EBE4] active:bg-[#BCE1D6] transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add to a trip
        </button>
      </div>
    </div>
  );
};
