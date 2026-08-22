import { useState } from 'react';
import { Dashboard } from './features/dashboard';
import { CreateTrip } from './features/dashboard/create trip/createtrip';
import { ItineraryBuilder } from './features/itinerary-builder/ItineraryBuilder';

function App() {
  const [page, setPage] = useState<
    'dashboard' | 'create-trip' | 'itinerary'
  >('dashboard');

  if (page === 'create-trip') {
    return (
      <CreateTrip
        onBack={() => setPage('dashboard')}
        onContinue={() => setPage('itinerary')}
      />
    );
  }

  if (page === 'itinerary') {
    return (
      <ItineraryBuilder
        onBack={() => setPage('create-trip')}
      />
    );
  }

  return (
    <Dashboard
      userName="Heet"
      onPlanNewTrip={() => setPage('create-trip')}
      onSelectTrip={(tripId) =>
        console.log('Selected trip:', tripId)
      }
    />
  );
}

export default App;