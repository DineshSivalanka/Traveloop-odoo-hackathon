import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, MapPin } from 'lucide-react';

interface City {
  id: string;
  name: string;
  country: string;
  description: string;
  cost_index: number;
  popularity: number;
  region?: string;
}

interface CitySearchProps {
  onNavigate: (page: string, data?: any) => void;
}

export const CitySearch: React.FC<CitySearchProps> = ({ onNavigate }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [filtered, setFiltered] = useState<City[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCities: City[] = [
        {
          id: '1',
          name: 'Paris',
          country: 'France',
          description: 'The City of Light with iconic landmarks and world-class cuisine',
          cost_index: 85,
          popularity: 95
        },
        {
          id: '2',
          name: 'Tokyo',
          country: 'Japan',
          description: 'Modern metropolis blending tradition and cutting-edge technology',
          cost_index: 80,
          popularity: 92
        },
        {
          id: '3',
          name: 'Barcelona',
          country: 'Spain',
          description: 'Vibrant city known for architecture, beaches, and nightlife',
          cost_index: 70,
          popularity: 88
        },
        {
          id: '4',
          name: 'Rome',
          country: 'Italy',
          description: 'Ancient history meets modern European charm',
          cost_index: 75,
          popularity: 90
        },
        {
          id: '5',
          name: 'New York',
          country: 'United States',
          description: 'The city that never sleeps with endless entertainment',
          cost_index: 90,
          popularity: 93
        },
        {
          id: '6',
          name: 'Amsterdam',
          country: 'Netherlands',
          description: 'Charming canals, bikes, and progressive culture',
          cost_index: 72,
          popularity: 86
        },
        {
          id: '7',
          name: 'Dubai',
          country: 'UAE',
          description: 'Luxury shopping and modern architecture in the desert',
          cost_index: 88,
          popularity: 89
        },
        {
          id: '8',
          name: 'Bangkok',
          country: 'Thailand',
          description: 'Bustling street markets and ornate temples',
          cost_index: 45,
          popularity: 85
        }
      ];

      setCities(mockCities);
      setFiltered(mockCities);

      // Extract unique countries
      const uniqueCountries = [...new Set(mockCities.map((c) => c.country))].sort();
      setCountries(uniqueCountries);
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (searchValue: string, countryValue: string) => {
    setSearch(searchValue);
    setSelectedCountry(countryValue);

    let result = cities;

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.country.toLowerCase().includes(searchLower)
      );
    }

    if (countryValue) {
      result = result.filter((c) => c.country === countryValue);
    }

    setFiltered(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(217, 70, 239, 0.05) 100%)' }}>
      {/* Header */}
      <header className="glass-card" style={{ borderRadius: 0, marginBottom: 0, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-purple-100 rounded-lg transition"
            style={{ background: 'rgba(99, 102, 241, 0.1)' }}
          >
            <ChevronLeft className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
            🌍 Explore Cities
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="glass-card large" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Find Your Next Destination</h2>
          
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="relative">
              <Search className="absolute" style={{ left: '12px', top: '12px', width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => handleFilter(e.target.value, selectedCountry)}
                placeholder="Search cities..."
                className="form-group"
                style={{
                  paddingLeft: '40px',
                  width: '100%'
                }}
              />
            </div>

            <select
              value={selectedCountry}
              onChange={(e) => handleFilter(search, e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: 'var(--text-main)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Found {filtered.length} cities
          </p>
        </div>

        {/* Cities Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading cities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <MapPin style={{ width: '48px', height: '48px', color: 'var(--secondary)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              No cities found matching your search
            </p>
          </div>
        ) : (
          <div className="grid-layout">
            {filtered.map((city) => (
              <div
                key={city.id}
                className="item-card"
                style={{
                  borderTop: '4px solid var(--accent)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                      {city.name}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {city.country}
                    </p>
                  </div>
                  <MapPin style={{ width: '20px', height: '20px', color: 'var(--accent)', flexShrink: 0 }} />
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.75rem 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {city.description}
                </p>

                <div className="grid-2" style={{ margin: '1rem 0', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Cost Index</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)', margin: '0.25rem 0 0 0' }}>
                      {city.cost_index}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Popularity</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--secondary)', margin: '0.25rem 0 0 0' }}>
                      {city.popularity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('cityDetail', { cityId: city.id, city })}
                  className="button"
                  style={{ marginTop: 'auto' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CitySearch;
