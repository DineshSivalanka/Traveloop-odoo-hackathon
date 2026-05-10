import React, { useEffect, useState } from "react";
import API from "./api";

function App() {
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [stops, setStops] = useState([]);
  const [city, setCity] = useState("");

  const [activities, setActivities] = useState([]);
  const [activityName, setActivityName] = useState("");

  const [fullTrip, setFullTrip] = useState(null);

  const fetchTrips = () => {
    API.get("/trips")
      .then(res => setTrips(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const createTrip = () => {
    API.post("/trips", {
      user_id: 1,
      title,
      description,
      start_date: "2026-05-20",
      end_date: "2026-05-25"
    }).then(() => {
      alert("Trip created");
      fetchTrips();
    });
  };

  const getStops = (tripId) => {
    API.get(`/stops/${tripId}`)
      .then(res => {
        setStops(res.data);
      })
      .catch(err => console.log(err));
  };

  const addStop = () => {
    API.post("/stops", {
      trip_id: 1,
      city_name: city,
      arrival_date: "2026-05-20",
      departure_date: "2026-05-22",
      stop_order: 1
    }).then(() => {
      alert("Stop added");
      getStops(1); 
    });
  };

  const getActivities = (stopId) => {
    API.get(`/activities/${stopId}`)
      .then(res => setActivities(res.data))
      .catch(err => console.log(err));
  };

  const addActivity = () => {
    API.post("/activities", {
      stop_id: 1,
      activity_name: activityName,
      activity_date: "2026-05-20",
      estimated_cost: 500,
      notes: "Fun activity"
    }).then(() => {
      alert("Activity added");
      getActivities(1);
    });
  };

  const getFullTripDemo = () => {
    API.get("/full_trip/1")
      .then(res => {
        setFullTrip(res.data);
        console.log("Full Demo Trip Data:", res.data);
      })
      .catch(err => console.log(err));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>✈️ Traveloop Planner</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>1. Create Trip</h3>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ marginRight: "10px" }} />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ marginRight: "10px" }} />
        <button onClick={createTrip}>Create Trip</button>
      </div>

      <hr />

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Left Column: Trips */}
        <div style={{ flex: 1 }}>
          <h2>Trips</h2>
          {trips.map((trip, index) => (
            <div key={index} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px", borderRadius: "5px" }}>
              <h3>{trip[2]}</h3>
              <p>{trip[3]}</p>
              <button onClick={() => getStops(trip[0])}>
                View Stops
              </button>
            </div>
          ))}
        </div>

        {/* Middle Column: Stops */}
        <div style={{ flex: 1 }}>
          <h2>Stops</h2>
          
          <div style={{ marginBottom: "10px" }}>
            <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={{ marginRight: "10px" }} />
            <button onClick={addStop}>Add Stop</button>
          </div>

          {stops.map((stop, index) => (
            <div key={index} style={{ border: "1px solid #aaa", margin: "10px 0", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
              <p><strong>{stop[2]}</strong> (City)</p>
              <p>{stop[3]} → {stop[4]}</p>
              <button onClick={() => getActivities(stop[0])}>
                View Activities
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Activities */}
        <div style={{ flex: 1 }}>
          <h2>Activities</h2>
          
          <div style={{ marginBottom: "10px" }}>
            <input placeholder="Activity" value={activityName} onChange={e => setActivityName(e.target.value)} style={{ marginRight: "10px" }} />
            <button onClick={addActivity}>Add Activity</button>
          </div>

          {activities.map((act, index) => (
            <div key={index} style={{ border: "1px solid #666", margin: "10px 0", padding: "10px", backgroundColor: "#eef", borderRadius: "5px" }}>
              <p><strong>{act[2]}</strong></p>
              <p>Cost: ₹{act[4]}</p>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ margin: "40px 0" }} />

      <div style={{ textAlign: "center", backgroundColor: "#333", color: "#fff", padding: "20px", borderRadius: "10px" }}>
        <h2>🔥 DEMO READY API 🔥</h2>
        <p>Get the entire nested trip JSON in one single call (Check console too!)</p>
        <button onClick={getFullTripDemo} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
          Load Full Trip Itinerary
        </button>
        
        {fullTrip && (
          <div style={{ marginTop: "20px", textAlign: "left", backgroundColor: "#222", padding: "20px", borderRadius: "5px" }}>
            <h3>{fullTrip.trip[2]}</h3>
            {fullTrip.details.map((detail, idx) => (
              <div key={idx} style={{ marginLeft: "20px", marginTop: "10px", paddingLeft: "10px", borderLeft: "2px solid #555" }}>
                <h4>📍 {detail.stop[2]}</h4>
                <ul>
                  {detail.activities.map((act, aIdx) => (
                    <li key={aIdx}>{act[2]} (₹{act[4]})</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
