import React, { useEffect, useState } from "react";
import API from "./api";

function App() {
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [stops, setStops] = useState([]);
  const [city, setCity] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [activities, setActivities] = useState([]);
  const [activityName, setActivityName] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(500);
  const [selectedStop, setSelectedStop] = useState(null);

  const [fullTrip, setFullTrip] = useState(null);

  const fetchTrips = () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    API.get(`/trips/${userId}`)
      .then(res => setTrips(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setPage("dashboard");
      fetchTrips();
    } else {
      setPage("login");
    }
  }, []);

  const handleLogin = () => {
    API.post("/login", { email, password })
      .then(res => {
        localStorage.setItem("user_id", res.data.user_id);
        setPage("dashboard");
        fetchTrips();
      })
      .catch(() => alert("Invalid login"));
  };

  const handleSignup = () => {
    API.post("/signup", { name, email, password })
      .then(res => {
        localStorage.setItem("user_id", res.data.user_id);
        setPage("dashboard");
        fetchTrips();
      })
      .catch(() => alert("Error signing up"));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    setPage("login");
    setTrips([]);
    setSelectedTrip(null);
    setStops([]);
    setSelectedStop(null);
    setActivities([]);
    setFullTrip(null);
  };

  const createTrip = () => {
    if (!title) return;
    const userId = localStorage.getItem("user_id");
    API.post("/trips", {
      user_id: userId,
      title,
      description,
      start_date: "2026-05-20",
      end_date: "2026-05-25"
    }).then(() => {
      setTitle("");
      setDescription("");
      fetchTrips();
    });
  };

  const getStops = (tripId) => {
    setStops([]);
    setActivities([]);
    setSelectedStop(null);
    API.get(`/stops/${tripId}`)
      .then(res => setStops(res.data))
      .catch(err => console.log(err));
  };

  const addStop = () => {
    if (!selectedTrip || !city) return;
    API.post("/stops", {
      trip_id: selectedTrip,
      city_name: city,
      arrival_date: "2026-05-20",
      departure_date: "2026-05-22",
      stop_order: stops.length + 1
    }).then(() => {
      setCity("");
      getStops(selectedTrip); 
    });
  };

  const getActivities = (stopId) => {
    API.get(`/activities/${stopId}`)
      .then(res => setActivities(res.data))
      .catch(err => console.log(err));
  };

  const addActivity = () => {
    if (!selectedStop || !activityName) return;
    API.post("/activities", {
      stop_id: selectedStop,
      activity_name: activityName,
      activity_date: "2026-05-20",
      estimated_cost: estimatedCost,
      notes: "Planned activity"
    }).then(() => {
      setActivityName("");
      setEstimatedCost(500);
      getActivities(selectedStop);
    });
  };

  const getFullTripDemo = () => {
    if (!selectedTrip) {
      alert("Please select a trip first.");
      return;
    }
    API.get(`/full_trip/${selectedTrip}`)
      .then(res => {
        setFullTrip(res.data);
      })
      .catch(err => alert("Error loading full trip. Please create one first."));
  };

  let total = 0;
  if (fullTrip) {
    fullTrip.details.forEach(item => {
      item.activities.forEach(act => {
        total += parseFloat(act[4] || 0);
      });
    });
  }

  return (
    <div className="app-container">
      {page === "login" && (
        <div style={{ padding: "50px", textAlign: "center", maxWidth: "400px", margin: "100px auto" }} className="glass-card">
          <h2>Login to Traveloop</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            <p>Don't have an account? <span style={{color:"#3b82f6", cursor:"pointer", fontWeight:"bold"}} onClick={() => setPage("signup")}>Sign Up</span></p>
          </div>
        </div>
      )}

      {page === "signup" && (
        <div style={{ padding: "50px", textAlign: "center", maxWidth: "400px", margin: "100px auto" }} className="glass-card">
          <h2>Sign Up for Traveloop</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleSignup}>Sign Up</button>
            <p>Already have an account? <span style={{color:"#3b82f6", cursor:"pointer", fontWeight:"bold"}} onClick={() => setPage("login")}>Login</span></p>
          </div>
        </div>
      )}

      {page === "dashboard" && localStorage.getItem("user_id") && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h1 className="header-title" style={{ margin: 0 }}>✈️ Traveloop</h1>
            <button onClick={handleLogout} className="outline">🚪 Logout</button>
          </div>
          
          <div className="glass-card" style={{ marginBottom: "40px" }}>
        <h3>Start a New Journey</h3>
        <p style={{color: "var(--text-muted)", marginBottom: "15px"}}>Plan your next big adventure.</p>
        <div className="input-group">
          <input placeholder="Trip Title (e.g. Europe Tour)" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Short Description" value={description} onChange={e => setDescription(e.target.value)} />
          <button onClick={createTrip}>Create Trip</button>
        </div>
      </div>

      <div className="grid-layout">
        {/* Left Column: Trips */}
        <div className="column">
          <h2 className="column-header">1. Select Trip</h2>
          {trips.length === 0 && <p style={{color: "var(--text-muted)"}}>No trips yet. Create one above!</p>}
          
          {trips.map((trip, index) => (
            <div key={index} className="item-card" style={{ border: selectedTrip === trip[0] ? "1px solid var(--accent)" : "" }}>
              <h3>{trip[2]}</h3>
              <p>{trip[3]}</p>
              <button className={selectedTrip === trip[0] ? "" : "outline"} onClick={() => {
                setSelectedTrip(trip[0]);
                getStops(trip[0]);
              }}>
                {selectedTrip === trip[0] ? "Selected" : "View Stops"}
              </button>
            </div>
          ))}
        </div>

        {/* Middle Column: Stops */}
        <div className="column" style={{ opacity: selectedTrip ? 1 : 0.4, pointerEvents: selectedTrip ? "auto" : "none" }}>
          <h2 className="column-header">2. Add Cities</h2>
          
          <div className="input-group">
            <input placeholder="City Name" value={city} onChange={e => setCity(e.target.value)} />
            <button onClick={addStop}>Add</button>
          </div>

          {stops.map((stop, index) => (
            <div key={index} className="item-card" style={{ border: selectedStop === stop[0] ? "1px solid var(--accent)" : "" }}>
              <h3 style={{display: "flex", alignItems: "center", gap: "8px"}}>📍 {stop[2]}</h3>
              <p>{stop[3]} to {stop[4]}</p>
              <button className={selectedStop === stop[0] ? "" : "outline"} onClick={() => {
                setSelectedStop(stop[0]);
                getActivities(stop[0]);
              }}>
                {selectedStop === stop[0] ? "Selected" : "View Activities"}
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Activities */}
        <div className="column" style={{ opacity: selectedStop ? 1 : 0.4, pointerEvents: selectedStop ? "auto" : "none" }}>
          <h2 className="column-header">3. Plan Activities</h2>
          
          <div className="input-group" style={{ flexDirection: "column" }}>
            <input placeholder="Activity (e.g. Scuba Diving)" value={activityName} onChange={e => setActivityName(e.target.value)} style={{ width: "100%", marginBottom: "0px" }} />
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
              <span style={{color: "var(--text-muted)"}}>Cost (₹):</span>
              <input type="number" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} style={{ width: "80px" }} />
              <button onClick={addActivity} style={{ flex: 1 }}>Add</button>
            </div>
          </div>

          {activities.map((act, index) => (
            <div key={index} className="item-card">
              <h3>⚡ {act[2]}</h3>
              <p>Estimated Cost: <strong style={{color: "#10b981"}}>₹{act[4]}</strong></p>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-section">
        <div className="demo-box">
          <h2 style={{fontSize: "2.5rem", marginBottom: "10px"}}>🔥 The "Mic Drop" API Demo</h2>
          <p style={{color: "var(--text-muted)", marginBottom: "30px", fontSize: "1.1rem"}}>
            This single API call fetches your Trip, Stops, Activities, and calculates your Budget!
          </p>
          <button onClick={getFullTripDemo} style={{ padding: "16px 32px", fontSize: "1.2rem", borderRadius: "12px", boxShadow: "0 10px 20px rgba(59, 130, 246, 0.4)" }}>
            Fetch Complete Itinerary & Budget
          </button>
          
          {fullTrip && (
            <div>
              <h2>{fullTrip.trip[2]}</h2>
              <h2>Total Trip Cost: ₹{total}</h2>

              {fullTrip.details.map((item, index) => {
                let cityTotal = item.activities.reduce((sum, act) => sum + parseFloat(act[4] || 0), 0);

                return (
                  <div key={index} style={{border: "1px solid gray", margin: "10px", padding: "10px"}}>
                    <h3>{item.stop[2]}</h3>

                    {item.activities.map((act, i) => (
                      <p key={i}>{act[2]} — ₹{act[4]}</p>
                    ))}

                    <p><b>City Cost: ₹{cityTotal}</b></p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* 🔒 Fallback: not logged in and not on auth pages */}
      {!localStorage.getItem("user_id") && page !== "login" && page !== "signup" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "20px"
        }}>
          <div className="glass-card" style={{ textAlign: "center", padding: "50px", maxWidth: "420px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🔒</div>
            <h2 style={{ marginBottom: "8px" }}>Access Restricted</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
              You need to be logged in to view this page.
            </p>
            <button onClick={() => setPage("login")} style={{ width: "100%" }}>
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
