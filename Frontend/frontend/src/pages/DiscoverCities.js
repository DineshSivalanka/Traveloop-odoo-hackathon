import React, { useState, useEffect } from 'react';
import API from '../api';

const DiscoverCities = ({ setTab, setSelectedCityId }) => {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [loading, setLoading] = useState(false);

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

  const renderStars = (popularity) => {
    const stars = Math.round(popularity / 20);
    return "⭐".repeat(stars || 1);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '48px' }}>
        <h1 className="header-title" style={{ fontSize: '3rem' }}>
          ✨ Discover Destinations
        </h1>
        <p className="header-subtitle">Explore the world's most popular cities and find inspiration for your next trip.</p>
      </header>

      {/* Search and Filters */}
      <div className="glass-card" style={{ marginBottom: '40px', padding: '32px', borderRadius: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Find a City</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search name, country or region..."
                style={{ paddingLeft: '44px', borderRadius: '16px' }}
              />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
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
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div className="animate-spin" style={{ fontSize: '3rem' }}>✈️</div>
        </div>
      ) : (
        <div className="grid-layout">
          {cities.map(city => (
            <div key={city.id} className="glass-card animate-scale-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                height: '220px', 
                background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url('${city.image_url || `https://source.unsplash.com/800x600/?${city.name},city`}') center/cover`,
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                  <span className="badge" style={{ marginBottom: '8px' }}>{city.region}</span>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>{city.name}</h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{city.country}</p>
                </div>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                  {city.description || "Explore the vibrant culture, historic landmarks, and local flavors of this amazing destination."}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cost Index</div>
                    <div style={{ fontWeight: '800', color: 'var(--accent-light)' }}>₹{city.cost_index} <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--text-muted)' }}>/ day</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Popularity</div>
                    <div>{renderStars(city.popularity)}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    onClick={() => {
                      setSelectedCityId(city.id);
                      setTab('cityDetail');
                    }}
                    className="outline"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => setTab('home')}
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    Add to Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cities.length === 0 && !loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '100px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🕵️</div>
          <h2>No cities found</h2>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters to find more destinations.</p>
          <button className="mt-3" onClick={() => { setSearch(''); setFilterRegion(''); loadCities(); }}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoverCities;
