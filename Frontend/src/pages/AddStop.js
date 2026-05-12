import React, { useState, useEffect } from 'react';
import API from '../api';

const AddStop = ({ tripId, setTab, setSelectedCityId }) => {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2*86400000).toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const regions = ["South Asia", "East Asia", "Europe", "Middle East", "Americas", "Africa"];

  const loadCities = React.useCallback((query = '', region = '') => {
    setLoading(true);
    let url = "cities";
    const params = [];
    if (query) params.push(`q=${query}`);
    if (region) params.push(`region=${region}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    API.get(url)
      .then(res => {
        setCities(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load cities:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadCities('', filterRegion);
  }, [filterRegion, loadCities]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length >= 2 || val.length === 0) {
      loadCities(val, filterRegion);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tripId) {
      setError('Please select a trip before adding a destination.');
      return;
    }
    if (!selectedCity) {
      setError('Please select a city from the list.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const existingStops = await API.get(`stops/${tripId}`);
      const nextOrder = (existingStops.data?.length || 0) + 1;

      await API.post("stops", {
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

  const renderStars = (popularity) => {
    const stars = Math.round(popularity / 20); // 0-100 to 0-5
    return "⭐".repeat(stars || 1);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="header-title" style={{ fontSize: '2.5rem' }}>
            📍 Add Destination
          </h1>
          <p className="header-subtitle">Discover the perfect cities to add to your itinerary.</p>
        </div>
        <button 
          className="outline" 
          onClick={() => setTab('tripDetail')}
          style={{ padding: '12px 24px', borderRadius: '14px' }}
        >
          ← Back to Itinerary
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
        
        {/* Filter & Search Section */}
        <div className="column">
          <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Search Cities</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search (Mumbai, Paris, etc.)..."
                  style={{ paddingLeft: '44px' }}
                />
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
              </div>
            </div>

            <div className="form-group">
              <label>Filter by Region</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className={filterRegion === '' ? 'small' : 'small outline'}
                  onClick={() => setFilterRegion('')}
                >
                  All
                </button>
                {regions.map(r => (
                  <button 
                    key={r}
                    className={filterRegion === r ? 'small' : 'small outline'}
                    onClick={() => setFilterRegion(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            maxHeight: '600px', 
            overflowY: 'auto', 
            paddingRight: '12px' 
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="animate-spin" style={{ fontSize: '2rem' }}>⌛</div>
              </div>
            ) : cities.map((city) => (
              <div
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className="glass-card animate-scale-in"
                style={{ 
                  cursor: 'pointer',
                  padding: '20px',
                  borderRadius: '20px',
                  border: selectedCity?.id === city.id ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                  background: selectedCity?.id === city.id ? 'var(--accent-subtle)' : 'var(--glass)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '12px', 
                    background: `url('${city.image_url || `https://source.unsplash.com/200x200/?${city.name},city`}') center/cover`,
                    flexShrink: 0,
                    border: '1px solid var(--card-border)'
                  }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{city.name}</h3>
                    <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '0.85rem' }}>{city.country} • {city.region}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-light)' }}>
                      ₹{city.cost_index} / day
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      {renderStars(city.popularity)}
                    </div>
                  </div>
                </div>
                
                {selectedCity?.id === city.id && (
                  <div className="animate-fade-in" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {city.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="column">
          <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', position: 'sticky', top: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '24px' }}>📅 Schedule Your Stop</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ 
                height: selectedCity ? '150px' : 'auto',
                padding: selectedCity ? '0' : '20px', 
                background: selectedCity ? `linear-gradient(to bottom, transparent, var(--overlay-scrim)), url('${selectedCity.image_url || `https://source.unsplash.com/600x300/?${selectedCity.name},city`}') center/cover` : 'var(--glass)', 
                borderRadius: '16px',
                border: '1px solid var(--card-border)',
                textAlign: selectedCity ? 'left' : 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                overflow: 'hidden'
              }}>
                {selectedCity ? (
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '2px', fontWeight: '800' }}>Confirming Stop</div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>📍 {selectedCity.name}</h3>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Select a city from the list to continue.</p>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Arrival</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Departure</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>


              {error && <div className="alert alert-error">⚠️ {error}</div>}

              <button
                type="submit"
                disabled={saving || !selectedCity || !tripId}
                className="block large"
              >
                {saving ? 'Adding...' : '🚀 Add to Itinerary'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStop;
