import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const CityDetail = ({ cityId, setTab }) => {
  const [city, setCity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCityData = useCallback(() => {
    setLoading(true);
    API.get(`/cities/${cityId}`)
      .then(res => {
        setCity(res.data);
        return API.get(`/activities/master/city/${cityId}`);
      })
      .then(res => {
        setActivities(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load city data:', err);
        setLoading(false);
      });
  }, [cityId]);

  useEffect(() => {
    if (cityId) {
      loadCityData();
    }
  }, [cityId, loadCityData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>📍</div>
        <p style={{ color: 'var(--text-muted)' }}>Exploring city highlights...</p>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px 40px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '40px', margin: '40px auto', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-muted)' }}>City Not Found</h2>
        <p style={{ opacity: 0.4, margin: '16px 0 24px' }}>We couldn't find the details for this destination. It might have been moved or deleted.</p>
        <button className="outline" onClick={() => setTab('addStop')} style={{ padding: '12px 24px' }}>Go Back</button>
      </div>
    );
  }

  const averageCost = activities.length > 0
    ? (activities.reduce((sum, a) => sum + (a.base_cost || 0), 0) / activities.length).toFixed(0)
    : 0;

  const categories = [...new Set(activities.map(a => a.category || 'General'))];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            className="outline" 
            onClick={() => setTab('addStop')}
            style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '1.2rem' }}
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', margin: 0 }}>{city.name}</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.6, letterSpacing: '3px', fontWeight: '700', color: 'var(--accent-light)' }}>{city.country.toUpperCase()}</p>
          </div>
        </div>
        <button onClick={() => setTab('addStop')} style={{ padding: '14px 28px', borderRadius: '16px', fontWeight: '700' }}>
          Plan Visit to {city.name}
        </button>
      </header>

      {/* ── Overview Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '56px' }}>
        {[
          { label: 'Cost Index', value: city.cost_index, icon: '💰', color: '#818cf8' },
          { label: 'Available Acts', value: activities.length, icon: '🎭', color: '#34d399' },
          { label: 'Avg. Experience', value: `₹${averageCost}`, icon: '🏷️', color: '#f59e0b' }
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '28px', borderRadius: '24px', borderBottom: `4px solid ${stat.color}40`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{stat.icon}</div>
            <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Curated Activities ── */}
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          🌟 Must-Experience in {city.name}
        </h2>
        
        {categories.length === 0 ? (
          <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏝️</div>
            <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>No curated activities found for this city yet. Check back soon!</p>
          </div>
        ) : (
          categories.map((category, idx) => (
            <div key={category} style={{ marginBottom: '48px' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                textTransform: 'uppercase', 
                letterSpacing: '3px', 
                color: 'var(--accent)', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{ width: '40px', height: '2px', background: 'var(--accent-gradient)', borderRadius: '2px' }}></span>
                {category}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {activities.filter(a => (a.category || 'General') === category).map((activity, j) => (
                  <div 
                    key={activity.id} 
                    className="item-card glass-card animate-scale-in" 
                    style={{ 
                      padding: '32px', 
                      borderRadius: '28px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      animationDelay: `${j * 0.05}s`
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '800' }}>{activity.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'var(--accent-light)', fontWeight: '800', fontSize: '1.1rem' }}>₹{activity.base_cost}</span>
                      <span style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: '600' }}>⏱️ {activity.duration_hours}h Session</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Call to Action ── */}
      <div style={{ 
        marginTop: '80px', 
        padding: 'clamp(32px, 6vw, 64px)', 
        borderRadius: '40px', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', fontSize: '8rem', opacity: 0.05 }}>✨</div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', margin: '0 0 16px 0' }}>Ready to explore {city.name}?</h2>
        <p style={{ opacity: 0.6, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Add this destination to your upcoming trip and start building your personalized itinerary today.
        </p>
        <button onClick={() => setTab('addStop')} style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '18px', boxShadow: '0 12px 32px rgba(99, 102, 241, 0.3)' }}>
          Start Planning Now
        </button>
      </div>
    </div>
  );
};

export default CityDetail;
