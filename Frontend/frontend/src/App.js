import React, { useState, useEffect } from 'react';
import API from "./api";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import AddStop from "./pages/AddStop";
import CityDetail from "./pages/CityDetail";
import StopDetail from "./pages/StopDetail";
import TripDetail from "./pages/TripDetail";
import Budget from "./pages/Budget";
import FullItinerary from "./pages/FullItinerary";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState("home"); 
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);

  const fetchTrips = React.useCallback(() => {
    if (!user) return;
    API.get(`/trips/${user.id}`)
      .then(res => setTrips(res.data))
      .catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user, fetchTrips]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>✨</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container" style={{ minHeight: "100vh", paddingTop: "40px" }}>
      <nav className="navbar">
        <h1 className="header-title" style={{ margin: 0, cursor: "pointer", fontSize: "1.8rem", letterSpacing: "2px" }} onClick={() => setTab("home")}>
          ✈️ TRAVELOOP
        </h1>
        
        <div className="nav-links">
          <button onClick={() => setTab("home")} className={tab === "home" ? "" : "outline"}>Dashboard</button>
          <button onClick={() => setTab("budget")} className={tab === "budget" ? "" : "outline"}>Budget</button>
          <button onClick={() => setTab("profile")} className={tab === "profile" ? "" : "outline"}>Settings</button>
          <button onClick={logout} className="outline" style={{ border: "1px solid #ef4444", color: "#ef4444" }}>Logout</button>
        </div>
      </nav>

      <main className="app-main">
        {tab === "home" && <Dashboard setTab={setTab} setSelectedTrip={setSelectedTrip} />}
        {tab === "createTrip" && <CreateTrip setTab={setTab} fetchTrips={fetchTrips} />}
        {tab === "budget" && <Budget trips={trips} />}
        {tab === "addStop" && <AddStop tripId={selectedTrip} setTab={setTab} setSelectedCityId={setSelectedCityId} />}
        {tab === "cityDetail" && <CityDetail cityId={selectedCityId} setTab={setTab} />}
        {tab === "tripDetail" && <TripDetail tripId={selectedTrip} setTab={setTab} setSelectedStopId={setSelectedStopId} />}
        {tab === "fullItinerary" && <FullItinerary tripId={selectedTrip} setTab={setTab} />}
        {tab === "stopDetail" && <StopDetail stopId={selectedStopId} tripId={selectedTrip} setTab={setTab} />}
        {tab === "profile" && <Profile handleLogout={logout} setTab={setTab} />}
      </main>
    </div>
  );
}

export default App;
