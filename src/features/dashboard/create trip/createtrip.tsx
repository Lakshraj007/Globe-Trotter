import React, { useState } from 'react';

interface CreateTripProps {
  onBack: () => void;
  onContinue: () => void;
}

export const CreateTrip: React.FC<CreateTripProps> = ({
  onBack,
  onContinue,
}) => {
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripName || !destination || !startDate || !endDate) {
      alert('Please fill all fields');
      return;
    }

    onContinue();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">

        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-slate-300 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-2">
          Plan a New Trip
        </h1>

        <p className="text-slate-400 mb-8">
          Create your trip and start building your itinerary.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-2xl p-6 space-y-6"
        >

          <div>
            <label className="block mb-2 font-medium">
              Trip Name
            </label>

            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g. Europe Summer Trip"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Destination
            </label>

            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, France"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block mb-2 font-medium">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 px-5 py-3 font-semibold"
          >
            Save & Continue
          </button>

        </form>
      </div>
    </main>
  );
};