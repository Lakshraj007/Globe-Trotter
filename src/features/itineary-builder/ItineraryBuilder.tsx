import React, { useState } from 'react';

interface ItineraryBuilderProps {
  onBack: () => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  onBack,
}) => {
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState('');

  const addCity = () => {
    if (!city.trim()) return;

    setCities((prev) => [...prev, city.trim()]);
    setCity('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-slate-300 hover:text-white"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Itinerary Builder
          </h1>

          <p className="text-slate-400 mt-2">
            Build your trip day by day.
          </p>
        </div>

        {/* Add City */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Add a City
          </h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCity();
                }
              }}
              placeholder="e.g. Paris"
              className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white"
            />

            <button
              type="button"
              onClick={addCity}
              className="rounded-lg bg-purple-600 hover:bg-purple-700 px-6 py-3 font-semibold"
            >
              Add City
            </button>
          </div>
        </div>

        {/* City List */}
        <div className="bg-slate-900 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-5">
            Your Itinerary
          </h2>

          {cities.length === 0 ? (
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center">
              <p className="text-slate-400">
                Add your first city to start planning.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cities.map((cityName, index) => (
                <div
                  key={`${cityName}-${index}`}
                  className="bg-slate-800 rounded-xl p-5"
                >
                  <p className="text-sm text-purple-400">
                    City {index + 1}
                  </p>

                  <h3 className="text-xl font-semibold mt-1">
                    {cityName}
                  </h3>

                  <p className="text-slate-400 mt-2">
                    Add activities and places for this city.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
};