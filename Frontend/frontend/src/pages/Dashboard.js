import React, { useEffect, useState } from 'react';
import API from '../api';

const Dashboard = ({ setTab, setSelectedTrip }) => {
  const [data, setData] = useState({
    trips: [],
    totalBudget: 0,
    popularCities: [],
    loading: true,
    userName: "Traveler"
  });

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    API.get(`/dashboard/${userId}`)
      .then(res => {
        setData({
          trips: res.data.recent_trips || [],
          totalBudget: res.data.total_budget || 0,
          popularCities: res.data.popular_cities || [],
          loading: false,
          userName: res.data.user_name || "Traveler"
        });
      })
      .catch(err => {
        console.error("Error loading dashboard:", err);
        setData(prev => ({ ...prev, loading: false }));
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff + 1 : 1;
  };

  if (data.loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>🌍</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '0 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{ 
        padding: '60px', 
        marginBottom: '50px', 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
        border: '1px solid rgba(217, 70, 239, 0.3)',
        borderRadius: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '15px', fontWeight: '900', letterSpacing: '-1px' }}>
            WELCOME BACK, <span style={{ color: 'var(--accent)' }}>{data.userName.toUpperCase()}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: '1.6' }}>
            Ready for your next adventure? Track your current plans or start exploring new destinations around the globe.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <button onClick={() => setTab('createTrip')} style={{ padding: '15px 35px', fontSize: '1.1rem' }}>
            Plan New Trip
          </button>
          <button onClick={() => setTab('addStop')} className="outline" style={{ padding: '15px 35px', fontSize: '1.1rem' }}>
            Explore Cities
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '60px' }}>
        <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px', letterSpacing: '1px' }}>ACTIVE TRIPS</p>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{data.trips.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px', letterSpacing: '1px' }}>CITIES EXPLORED</p>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{data.trips.length * 3}</h2>
        </div>
        <div className="glass-card" style={{ padding: '25px', textAlign: 'center', borderBottom: '3px solid #10b981' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px', letterSpacing: '1px' }}>TOTAL BUDGET</p>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#10b981' }}>₹{data.totalBudget.toLocaleString()}</h2>
        </div>
      </div>

      {/* Your Trips Section */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>🌎 Your Upcoming Trips</h2>
        </div>

        {data.trips.length === 0 ? (
          <div className="glass-card" style={{ padding: '80px', textAlign: 'center', opacity: 0.6 }}>
            <p style={{ fontSize: '1.2rem' }}>No trips planned yet. Time to start exploring!</p>
            <button className="outline" onClick={() => setTab('createTrip')} style={{ marginTop: '20px' }}>Plan Your First Journey</button>
          </div>
        ) : (
          <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {data.trips.map((trip) => (
              <div 
                key={trip.id} 
                className="item-card glass-card animate-scale-in" 
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedTrip(trip.id);
                  setTab('tripDetail');
                }}
              >
                <div style={{ 
                  height: '180px', 
                  width: '100%', 
                  background: trip.cover_image_url ? `url(${trip.cover_image_url}) center/cover` : 'linear-gradient(45deg, #1e1b4b, #312e81)',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '15px', 
                    right: '15px', 
                    background: 'rgba(0,0,0,0.6)', 
                    padding: '5px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    📅 {calculateDays(trip.start_date, trip.end_date)} Days
                  </div>
                </div>
                <div style={{ padding: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{trip.title}</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5', minHeight: '42px' }}>
                    {trip.description || "No description provided."}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Budget</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{trip.budget ? trip.budget.toLocaleString() : "0"}</span>
                    </div>
                    <button className="outline" style={{ padding: '5px 15px', fontSize: '0.8rem' }}>View Itinerary</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Destination Inspiration */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>✨ Destination Inspiration</h2>
        <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          {data.popularCities.map((city) => (
            <div 
              key={city.id} 
              className="glass-card animate-slide-up" 
              style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setTab('addStop')}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(217, 70, 239, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                📍
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{city.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>{city.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
