import React, { useState } from 'react';
import API from '../api';

const AddStop = ({ tripId, setTab, setSelectedCityId }) => {
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [startDate, setStartDate] = useState('2026-05-20');
  const [endDate, setEndDate] = useState('2026-05-22');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }

    setSaving(true);
    setError('');

    API.post("/stops", {
      trip_id: tripId,
      city_name: selectedCity.name,
      city_id: selectedCity.id,
      arrival_date: startDate,
      departure_date: endDate,
      stop_order: 1 
    }).then(() => {
      setSaving(false);
      setTab('tripDetail');
    }).catch(err => {
      setError('Failed to add stop');
      setSaving(false);
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          className="outline" 
          onClick={() => setTab('tripDetail')}
          style={{ padding: '8px 15px' }}
        >
          ← Back
        </button>
        <h1 className="header-title" style={{ margin: 0 }}>Add New Stop</h1>
      </header>

      <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* City Search */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h2 className="column-header" style={{ border: 0, marginBottom: '20px' }}>Select City</h2>
          
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search cities (e.g. Paris, Tokyo)..."
              style={{ width: '100%' }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Searching...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
              {filtered.map((city) => (
                <div
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className="item-card animate-scale-in"
                  style={{ 
                    cursor: 'pointer',
                    border: selectedCity?.id === city.id ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                    background: selectedCity?.id === city.id ? 'rgba(217, 70, 239, 0.1)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <h3 style={{ margin: 0 }}>{city.name}</h3>
                  <p style={{ margin: '5px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>{city.country}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <p style={{ margin: 0, color: 'var(--accent)', fontSize: '0.8rem' }}>Cost Index: {city.cost_index}</p>
                    <button 
                      className="outline" 
                      style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCityId(city.id);
                        setTab('cityDetail');
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
              {search.length >= 2 && filtered.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No cities found.</div>
              )}
            </div>
          )}
        </div>

        {/* Stop Details */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h2 className="column-header" style={{ border: 0, marginBottom: '20px' }}>Stop Details</h2>
          
          {selectedCity && (
            <div style={{ 
              marginBottom: '25px', 
              padding: '15px', 
              background: 'rgba(217, 70, 239, 0.05)', 
              borderRadius: '12px',
              border: '1px solid rgba(217, 70, 239, 0.2)'
            }}>
              <h3 style={{ margin: 0, color: 'var(--accent)' }}>📍 {selectedCity.name}</h3>
              <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '0.9rem' }}>Exploring {selectedCity.country}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px' }}>Arrival Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px' }}>Departure Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px' }}>Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '100px', 
                  background: 'rgba(0,0,0,0.2)', 
                  color: '#fff', 
                  border: '1px solid var(--card-border)', 
                  borderRadius: '12px', 
                  padding: '12px',
                  resize: 'none'
                }}
                placeholder="Any specific plans for this city?"
              />
            </div>

            {error && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={saving || !selectedCity}
                style={{ flex: 2 }}
              >
                {saving ? 'Adding...' : 'Confirm Stop'}
              </button>
              <button
                type="button"
                className="outline"
                onClick={() => setTab('planner')}
                style={{ flex: 1 }}
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
