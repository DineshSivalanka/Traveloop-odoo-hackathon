import React, { useEffect, useState } from 'react';
import API from '../api';

const Dashboard = ({ setTab }) => {
  const [trips, setTrips] = useState([]);
  const [totalCities, setTotalCities] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    // Step 1: fetch all trips for user
    API.get(`/trips/${userId}`)
      .then(async res => {
        const fetchedTrips = res.data;
        setTrips(fetchedTrips);

        let cityCount = 0;
        let activityCount = 0;

        // Step 2: for each trip, fetch stops
        await Promise.all(
          fetchedTrips.map(async trip => {
            try {
              const stopsRes = await API.get(`/stops/${trip[0]}`);
              const stops = stopsRes.data;
              cityCount += stops.length;

              // Step 3: for each stop, fetch activities
              await Promise.all(
                stops.map(async stop => {
                  try {
                    const actRes = await API.get(`/activities/${stop[0]}`);
                    activityCount += actRes.data.length;
                  } catch (_) {}
                })
              );
            } catch (_) {}
          })
        );

        setTotalCities(cityCount);
        setTotalActivities(activityCount);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <h1>🏠 Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Welcome back! Here's a live overview of your travels.
      </p>

      {/* ── Stats Row ── */}
      <div className="grid-layout">
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3>✈️ Total Trips</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--secondary)', margin: '10px 0' }}>
            {loading ? '...' : trips.length}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Planned journeys</p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3>📍 Cities Explored</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent)', margin: '10px 0' }}>
            {loading ? '...' : totalCities}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Stops across all trips</p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3>⚡ Activities Planned</h3>
          <h1 style={{ fontSize: '3rem', color: '#10b981', margin: '10px 0' }}>
            {loading ? '...' : totalActivities}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Total activities logged</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3>🚀 Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('planner')} style={{ flex: 1 }}>
            ✨ Plan New Trip
          </button>
          <button onClick={() => setTab('planner')} className="outline" style={{ flex: 1 }}>
            🗺️ Open Trip Planner
          </button>
        </div>
      </div>

      {/* ── Recent Trips ── */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>📋 Recent Trips</h2>
      <div className="grid-layout">
        {trips.slice(0, 3).map((trip, idx) => (
          <div key={idx} className="glass-card">
            <h3>{trip[2]}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
              {trip[3]}
            </p>
            <span style={{
              background: 'rgba(59,130,246,0.15)',
              color: 'var(--accent)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {trip[4]} → {trip[5]}
            </span>
          </div>
        ))}

        {!loading && trips.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🌍</div>
            <h3>No trips yet!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Start planning your first adventure.
            </p>
            <button onClick={() => setTab('planner')}>✨ Create My First Trip</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
