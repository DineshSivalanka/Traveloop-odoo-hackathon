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
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>📍</div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px' }}>
        <h2 style={{ opacity: 0.5 }}>City Not Found</h2>
        <button className="outline" onClick={() => setTab('addStop')} style={{ marginTop: '20px' }}>Go Back</button>
      </div>
    );
  }

  // city: [id, name, country, cost_index]
  // activity: [id, city_id, name, category, base_cost, duration_hours]
  const averageCost = activities.length > 0
    ? (activities.reduce((sum, a) => sum + (a.base_cost || 0), 0) / activities.length).toFixed(0)
    : 0;

  const categories = [...new Set(activities.map(a => a.category || 'General'))];

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          className="outline" 
          onClick={() => setTab('addStop')}
          style={{ padding: '8px 15px' }}
        >
          ← Back
        </button>
        <div>
          <h1 className="header-title" style={{ margin: 0 }}>{city.name}</h1>
          <p style={{ margin: 0, opacity: 0.6, letterSpacing: '2px' }}>{city.country.toUpperCase()}</p>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '5px' }}>Cost Index</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{city.cost_index}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '5px' }}>Activities Available</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{activities.length}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '5px' }}>Average Cost</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>₹{averageCost}</p>
        </div>
      </div>

      {/* Activities Section */}
      <div className="animate-slide-up">
        <h2 className="column-header" style={{ marginBottom: '30px' }}>Top Activities in {city.name}</h2>
        
        {categories.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
            <p>No curated activities found for this city yet.</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                textTransform: 'uppercase', 
                letterSpacing: '2px', 
                color: 'var(--accent)', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ width: '30px', height: '1px', background: 'var(--accent)' }}></span>
                {category}
              </h3>
              
              <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {activities.filter(a => (a.category || 'General') === category).map(activity => (
                  <div key={activity.id} className="item-card animate-scale-in" style={{ padding: '25px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{activity.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{activity.base_cost}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>⏱️ {activity.duration_hours} Hours</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Call to Action */}
      <div className="glass-card" style={{ 
        marginTop: '60px', 
        padding: '40px', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ margin: '0 0 15px 0' }}>Ready to visit {city.name}?</h2>
        <p style={{ opacity: 0.7, marginBottom: '25px' }}>Add this city to your itinerary and start planning your activities.</p>
        <button onClick={() => setTab('addStop')} style={{ padding: '12px 40px' }}>
          Plan This City
        </button>
      </div>
    </div>
  );
};

export default CityDetail;
