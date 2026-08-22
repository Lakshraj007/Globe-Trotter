import React, { useRef } from 'react';
import type { Destination } from '../types';
import { DestinationCard } from './DestinationCard';

interface GetInspiredRailProps {
  destinations: Destination[];
  onAddDestination?: (destination: Destination) => void;
  title?: string;
  subtitle?: string;
}

export const GetInspiredRail: React.FC<GetInspiredRailProps> = ({
  destinations,
  onAddDestination,
  title = 'Get Inspired',
  subtitle = 'Curated destination ideas ready to drop into your next trip.',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!destinations || destinations.length === 0) return null;

  return (
    <section aria-label="Get Inspired destinations" className="my-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1B18] font-serif">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#5B594F]">{subtitle}</p>
        </div>

        {/* Scroll Controls for Desktop */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Scroll destinations left"
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full border border-[#E4E0D6] bg-white hover:bg-[#F3F1EB] text-[#1C1B18] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Scroll destinations right"
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full border border-[#E4E0D6] bg-white hover:bg-[#F3F1EB] text-[#1C1B18] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {destinations.map((dest) => (
          <div key={dest.id} style={{ scrollSnapAlign: 'start' }}>
            <DestinationCard
              destination={dest}
              onAddDestination={onAddDestination}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
