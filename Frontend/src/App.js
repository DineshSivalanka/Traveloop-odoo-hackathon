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
import PublicView from "./pages/PublicView";
import DiscoverCities from "./pages/DiscoverCities";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState("home");
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [shareToken, setShareToken] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = `${theme}-theme`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Check for share link in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      const token = hash.split('=')[1];
      setShareToken(token);
      setTab('publicView');
    }
  }, []);

  const fetchTrips = React.useCallback(() => {
    if (!user) return;
    API.get(`/trips/${user.id}`)
      .then(res => setTrips(res.data))
      .catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user, fetchTrips]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (authLoading) {
    return (
      <div className="app-loading-screen">
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>✨</div>
      </div>
    );
  }

  // Handle Public View separately so it doesn't require login
  if (tab === 'publicView' && shareToken) {
    return <PublicView token={shareToken} />;
  }

  if (!user) return <AuthPage theme={theme} toggleTheme={toggleTheme} />;

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'explore', label: 'Explore', icon: '✨' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'profile', label: 'Settings', icon: '⚙️' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-shell">

      <header className="app-header">
        <div className="header-left">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
          <div className="header-logo" onClick={() => setTab('home')}>
            TRAVELOOP
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`header-nav-btn${tab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="sidebar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </header>

      <div
        className={`sidebar-overlay${isSidebarOpen ? ' active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`sidebar${!isSidebarOpen ? ' collapsed' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item${tab === item.id ? ' active' : ''}`}
              onClick={() => {
                setTab(item.id);
                if (window.innerWidth <= 1024) setIsSidebarOpen(false);
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <div className={`main-wrapper${isSidebarOpen ? ' sidebar-open' : ''}`}>
        <main className="main-content">
          {tab === "home" && <Dashboard setTab={setTab} setSelectedTrip={setSelectedTrip} />}
          {tab === "explore" && <DiscoverCities setTab={setTab} setSelectedCityId={setSelectedCityId} />}
          {tab === "createTrip" && <CreateTrip setTab={setTab} fetchTrips={fetchTrips} setSelectedTrip={setSelectedTrip} />}
          {tab === "budget" && <Budget trips={trips} />}
          {tab === "addStop" && <AddStop tripId={selectedTrip} setTab={setTab} setSelectedCityId={setSelectedCityId} />}
          {tab === "cityDetail" && <CityDetail cityId={selectedCityId} setTab={setTab} />}
          {tab === "tripDetail" && <TripDetail tripId={selectedTrip} setTab={setTab} setSelectedStopId={setSelectedStopId} />}
          {tab === "fullItinerary" && <FullItinerary tripId={selectedTrip} setTab={setTab} />}
          {tab === "stopDetail" && <StopDetail stopId={selectedStopId} tripId={selectedTrip} setTab={setTab} />}
          {tab === "profile" && <Profile handleLogout={logout} setTab={setTab} />}
        </main>

        <footer className="app-footer">
          <p>© 2026 Traveloop. All rights reserved.</p>
        </footer>
      </div>

    </div>
  );
}

export default App;
