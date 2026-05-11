import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const CityDetail = ({ cityId, setTab }) => {
  const [city, setCity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSaved, setIsSaved] = useState(false);

  const loadCityData = useCallback(() => {
    setLoading(true);
    const userId = localStorage.getItem('user_id');
    
    API.get(`/cities/${cityId}`)
      .then(res => {
        setCity(res.data);
        return API.get(`/activities/master/city/${cityId}`);
      })
      .then(res => {
        setActivities(res.data || []);
        if (userId) {
          return API.get(`/saved/${userId}`);
        }
      })
      .then(res => {
        if (res && res.data) {
          setIsSaved(res.data.some(c => c.id === parseInt(cityId)));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load city data:', err);
        setLoading(false);
      });
  }, [cityId]);

  const handleSave = () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    if (isSaved) {
      API.delete(`/saved/${userId}/${cityId}`)
        .then(() => setIsSaved(false))
        .catch(err => console.error(err));
    } else {
      API.post(`/saved`, { user_id: userId, city_id: cityId })
        .then(() => setIsSaved(true))
        .catch(err => console.error(err));
    }
  };

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
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px 40px', border: '1px dashed var(--card-border)', borderRadius: '40px', margin: '40px auto', maxWidth: '600px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', margin: 0 }}>{city.name}</h1>
              <p style={{ margin: '4px 0 0', opacity: 0.6, letterSpacing: '3px', fontWeight: '700', color: 'var(--accent-light)' }}>{city.country.toUpperCase()}</p>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={handleSave}
              style={{ 
                background: isSaved ? 'var(--accent-subtle)' : 'var(--glass)', 
                border: '1px solid var(--card-border)', 
                fontSize: '1.5rem', 
                width: '48px', 
                height: '48px', 
                borderRadius: '16px', 
                cursor: 'pointer',
                color: isSaved ? 'var(--accent)' : 'var(--text-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSaved ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
        <button type="button" onClick={() => setTab('addStop')} style={{ padding: '14px 28px', borderRadius: '16px', fontWeight: '700' }}>
          Plan Visit to {city.name}
        </button>
      </header>

      {/* ── Overview Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '56px' }}>
        {[
          { label: 'Cost Index', value: city.cost_index, icon: '💰', color: 'var(--accent-light)' },
          { label: 'Available Acts', value: activities.length, icon: '🎭', color: 'var(--secondary)' },
          { label: 'Avg. Experience', value: `₹${averageCost}`, icon: '🏷️', color: 'var(--accent)' }
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
          <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '32px', border: '1px dashed var(--card-border)' }}>
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
                      background: 'var(--card-bg-light)',
                      border: '1px solid var(--card-border)',
                      animationDelay: `${j * 0.05}s`
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '800' }}>{activity.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
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
        background: 'var(--cta-panel-bg)',
        border: '1px solid var(--accent-subtle-border)',
        boxShadow: 'var(--cta-panel-shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', fontSize: '8rem', opacity: 0.05 }}>✨</div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', margin: '0 0 16px 0' }}>Ready to explore {city.name}?</h2>
        <p style={{ opacity: 0.6, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Add this destination to your upcoming trip and start building your personalized itinerary today.
        </p>
        <button type="button" onClick={() => setTab('addStop')} style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '18px', boxShadow: '0 14px 40px var(--accent-glow)' }}>
          Start Planning Now
        </button>
      </div>
    </div>
  );
};

export default CityDetail;
