import React, { useState } from "react";

interface Activity {
  id: number;
  name: string;
  time: string;
  type: string;
}

interface City {
  id: number;
  name: string;
  activities: Activity[];
}

interface ItineraryBuilderProps {
  onBack: () => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  onBack,
}) => {
  const [cities, setCities] = useState<City[]>([]);

  const [city, setCity] = useState("");

  const [selectedCity, setSelectedCity] = useState<number | null>(null);

  const [activityName, setActivityName] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityType, setActivityType] = useState("Sightseeing");

  // -------------------------
  // ADD CITY
  // -------------------------

  const addCity = () => {
    if (!city.trim()) return;

    const newCity: City = {
      id: Date.now(),
      name: city.trim(),
      activities: [],
    };

    setCities((prev) => [...prev, newCity]);
    setCity("");
  };

  // -------------------------
  // REMOVE CITY
  // -------------------------

  const removeCity = (cityId: number) => {
    setCities((prev) => prev.filter((item) => item.id !== cityId));

    if (selectedCity === cityId) {
      setSelectedCity(null);
    }
  };

  // -------------------------
  // SELECT CITY
  // -------------------------

  const selectCity = (cityId: number) => {
    setSelectedCity(cityId);

    setActivityName("");
    setActivityTime("");
    setActivityType("Sightseeing");
  };

  // -------------------------
  // ADD ACTIVITY
  // -------------------------

  const addActivity = () => {
    if (selectedCity === null) return;
    if (!activityName.trim()) return;

    const newActivity: Activity = {
      id: Date.now(),
      name: activityName.trim(),
      time: activityTime,
      type: activityType,
    };

    setCities((prev) =>
      prev.map((item) =>
        item.id === selectedCity
          ? {
              ...item,
              activities: [...item.activities, newActivity],
            }
          : item
      )
    );

    setActivityName("");
    setActivityTime("");
    setActivityType("Sightseeing");
  };

  // -------------------------
  // REMOVE ACTIVITY
  // -------------------------

  const removeActivity = (cityId: number, activityId: number) => {
    setCities((prev) =>
      prev.map((item) =>
        item.id === cityId
          ? {
              ...item,
              activities: item.activities.filter(
                (activity) => activity.id !== activityId
              ),
            }
          : item
      )
    );
  };

  // -------------------------
  // UI
  // -------------------------

  return (
    <div className="itinerary-page">

      {/* BACK BUTTON */}

      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      {/* HEADER */}

      <h1>Itinerary Builder</h1>

      <p className="itinerary-subtitle">
        Build your trip day by day.
      </p>

      {/* ADD CITY */}

      <section className="itinerary-form">
        <h2>🌍 Add a City</h2>

        <div className="input-row">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addCity();
              }
            }}
            placeholder="e.g. Paris"
          />

          <button className="primary-button" onClick={addCity}>
            + Add City
          </button>
        </div>
      </section>

      {/* ACTIVITY FORM */}

      {selectedCity !== null && (
        <section className="activity-form">
          <h2>✨ Add Activity</h2>

          <div className="input-row">

            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Activity name"
            />

            <input
              type="time"
              value={activityTime}
              onChange={(e) => setActivityTime(e.target.value)}
            />

            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
            >
              <option value="Sightseeing">Sightseeing</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Adventure">Adventure</option>
              <option value="Relaxation">Relaxation</option>
              <option value="Transport">Transport</option>
            </select>

            <button className="primary-button" onClick={addActivity}>
              + Add Activity
            </button>

          </div>
        </section>
      )}

      {/* ITINERARY */}

      <section className="itinerary-container">

        <h2>✈️ Your Itinerary</h2>

        {cities.length === 0 ? (
          <p className="itinerary-subtitle">
            Add your first city to start planning.
          </p>
        ) : (
          cities.map((item, index) => (
            <div className="day-card" key={item.id}>

              {/* DAY HEADER */}

              <div className="day-title">

                <h3>
                  <span className="day-number">
                    Day {index + 1}
                  </span>
                  {" : "}
                  {item.name}
                </h3>

                <div>
                  <button
                    className="secondary-button"
                    onClick={() => selectCity(item.id)}
                  >
                    + Add Activity
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => removeCity(item.id)}
                  >
                    Remove City
                  </button>
                </div>

              </div>

              {/* ACTIVITIES */}

              {item.activities.length === 0 ? (
                <p className="activity-details">
                  No activities added yet.
                </p>
              ) : (
                item.activities.map((activity) => (
                  <div
                    className="activity-card"
                    key={activity.id}
                  >

                    <h4>
                      📍 {activity.name}
                    </h4>

                    <p className="activity-details">
                      {activity.time
                        ? `🕐 ${activity.time}`
                        : "🕐 Time not set"}
                      {" • "}
                      {activity.type}
                    </p>

                    <button
                      className="danger-button"
                      onClick={() =>
                        removeActivity(item.id, activity.id)
                      }
                    >
                      Remove Activity
                    </button>

                  </div>
                ))
              )}

            </div>
          ))
        )}

      </section>

    </div>
  );
};

export default ItineraryBuilder;