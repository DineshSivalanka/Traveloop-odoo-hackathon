import React, { useState } from 'react';
import API from '../api';

const AddStop = ({ tripId, setTab, setSelectedCityId }) => {
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2*86400000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (value) => {
    setSearch(value);
    if (value.length < 2) {
      setFiltered([]);
      return;
    }
    
    setLoading(true);
    API.get(`/cities/search?q=${value}`)
      .then(res => {
        setFiltered(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load cities:', err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCity) {
      setError('Please select a city from the list.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Get existing stops to determine next order
      const existingStops = await API.get(`/stops/${tripId}`);
      const nextOrder = (existingStops.data?.length || 0) + 1;

      await API.post("/stops", {
        trip_id: tripId,
        city_name: selectedCity.name,
        city_id: selectedCity.id,
        arrival_date: startDate,
        departure_date: endDate,
        stop_order: nextOrder 
      });
      
      setSaving(false);
      setTab('tripDetail');
    } catch (err) {
      console.error(err);
      setError('Failed to add stop. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '8px' }}>
            📍 Add <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>New Destination</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Find your next stop and schedule your visit.</p>
        </div>
        <button 
          className="outline" 
          onClick={() => setTab('tripDetail')}
          style={{ padding: '12px 24px', borderRadius: '14px' }}
        >
          ← Back to Itinerary
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
        
        {/* City Search Section */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔍 1. Find a City
          </h2>
          
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search (e.g. Paris, Tokyo, Bali)..."
              style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', fontSize: '1rem', background: 'rgba(255,255,255,0.03)' }}
            />
            {loading && (
              <span className="animate-spin" style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>⌛</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto', paddingRight: '8px' }}>
            {filtered.map((city) => (
              <div
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className="animate-scale-in"
                style={{ 
                  cursor: 'pointer',
                  padding: '16px',
                  borderRadius: '16px',
                  border: selectedCity?.id === city.id ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.06)',
                  background: selectedCity?.id === city.id ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{city.name}</h3>
                    <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.85rem' }}>🌍 {city.country}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: '600' }}>
                    Cost Index: {city.cost_index}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    className="outline" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '10px', flex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCityId(city.id);
                      setTab('cityDetail');
                    }}
                  >
                    Details
                  </button>
                  {selectedCity?.id === city.id && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '700' }}>
                      SELECTED ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
            {search.length >= 2 && filtered.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🕵️</div>
                No cities found. Try another name.
              </div>
            )}
            {search.length < 2 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.4 }}>
                Start typing to discover amazing places...
              </div>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📅 2. Schedule Visit
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedCity ? (
              <div className="animate-scale-in" style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(217, 70, 239, 0.1) 100%)', 
                borderRadius: '16px',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Current Selection</div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>📍 {selectedCity.name}</h3>
              </div>
            ) : (
              <div style={{ 
                padding: '24px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '16px',
                border: '1px dashed rgba(255,255,255,0.1)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}>
                Select a city from the left to continue.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Arrival Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', padding: '12px' }}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Departure Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', padding: '12px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Notes & Goals</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '120px', 
                  background: 'rgba(0,0,0,0.2)', 
                  color: '#fff', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  resize: 'none',
                  fontSize: '0.95rem'
                }}
                placeholder="What do you want to see or do here? Any specific must-visit spots?"
              />
            </div>

            {error && (
              <div className="animate-shake" style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171', fontSize: '0.85rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={saving || !selectedCity}
                style={{ flex: 2, padding: '16px' }}
              >
                {saving ? <><span className="animate-spin" style={{ marginRight: '8px' }}>⌛</span> Adding...</> : '🚀 Add to Itinerary'}
              </button>
              <button
                type="button"
                className="outline"
                onClick={() => setTab('tripDetail')}
                style={{ flex: 1, padding: '16px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStop;
