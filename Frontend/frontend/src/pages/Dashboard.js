import React, { useEffect, useState } from 'react';
import API from '../api';

const Dashboard = ({ setTab }) => {
  const [data, setData] = useState({
    trips: [],
    totalBudget: 0,
    popularCities: [],
    loading: true
  });

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    API.get(`/dashboard/${userId}`)
      .then(res => {
        setData({
          trips: res.data.recent_trips,
          totalBudget: res.data.total_budget,
          popularCities: res.data.popular_cities,
          loading: false
        });
      })
      .catch(err => {
        console.log("Error loading dashboard:", err);
        setData(prev => ({ ...prev, loading: false }));
      });
  }, []);

  return (
    <div className="page-container" style={{ padding: '0 2rem 2rem 2rem' }}>
      <h1 style={{ marginBottom: "5px" }}>🏠 Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Welcome back! Here's a live overview of your travels.
      </p>

      {/* ── Stats Row ── */}
      <div className="grid-layout">
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3>✈️ Upcoming Trips</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--secondary)', margin: '10px 0' }}>
            {data.loading ? '...' : data.trips.length}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Planned journeys</p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3>📍 Inspiration</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent)', margin: '10px 0' }}>
            {data.loading ? '...' : data.popularCities.length}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Hot destinations</p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3>💰 Total Budget</h3>
          <h1 style={{ fontSize: '2.5rem', color: '#10b981', margin: '10px 0' }}>
            {data.loading ? '...' : `₹${data.totalBudget}`}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Estimated spending</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3>🚀 Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('createTrip')} style={{ flex: 1 }}>
            ✨ Plan New Trip
          </button>
          <button onClick={() => setTab('planner')} className="outline" style={{ flex: 1 }}>
            🗺️ Open Trip Planner
          </button>
        </div>
      </div>

      <div className="grid-layout" style={{ marginTop: "2rem" }}>
        {/* ── Recent Trips ── */}
        <div className="column">
          <h2 style={{ marginBottom: '1.5rem' }}>📋 Your Trips</h2>
          {data.trips.map((trip, idx) => (
            <div key={idx} className="item-card">
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

<<<<<<< HEAD
          {!data.loading && data.trips.length === 0 && (
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

        {/* ── Popular Destinations ── */}
        <div className="column">
          <h2 style={{ marginBottom: '1.5rem' }}>🌟 Popular Cities</h2>
          {data.popularCities.map((city, idx) => (
            <div key={idx} className="item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>📍 {city[1]}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{city[2]}</p>
              </div>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>Cost Index: {city[3]}</span>
            </div>
          ))}
          {!data.loading && data.popularCities.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No popular cities tracked yet.</p>
            </div>
          )}
        </div>
=======
        {!loading && trips.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🌍</div>
            <h3>No trips yet!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Start planning your first adventure.
            </p>
            <button onClick={() => setTab('createTrip')}>✨ Create My First Trip</button>
          </div>
        )}
>>>>>>> sai
      </div>
    </div>
  );
};

export default Dashboard;
