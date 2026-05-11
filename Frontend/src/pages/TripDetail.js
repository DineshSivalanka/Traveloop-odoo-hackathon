import React, { useState, useEffect } from 'react';
import API from '../api';
import TripNotes from '../components/TripNotes';

const TripDetail = ({ tripId, setTab, setSelectedStopId }) => {
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTripData = React.useCallback(async () => {
    setLoading(true);
    try {
      const tripRes = await API.get(`/trips/detail/${tripId}`);
      setTrip(tripRes.data);

      const stopsRes = await API.get(`/stops/${tripId}`);
      setStops(stopsRes.data || []);
    } catch (err) {
      console.error('Failed to load trip details:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      loadTripData();
    }
  }, [tripId, loadTripData]);

  const handleDeleteStop = (stopId) => {
    if (window.confirm("Remove this city from your itinerary?")) {
      API.delete(`/stops/item/${stopId}`).then(() => loadTripData());
    }
  };

  const handleDeleteTrip = () => {
    if (window.confirm("Are you sure you want to delete this entire trip? This cannot be undone.")) {
      API.delete(`/trips/${tripId}`).then(() => {
        setTab('home');
      });
    }
  };

  const handleMoveStop = async (index, direction) => {
    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newStops.length) return;
    
    // Swap
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    
    setStops(newStops); // Optimistic update
    
    try {
      const orderedIds = newStops.map(s => s.id);
      await API.put(`/stops/reorder/${tripId}`, { ordered_ids: orderedIds });
      // Reload to ensure sync
      loadTripData();
    } catch (err) {
      console.error("Failed to reorder stops:", err);
      loadTripData(); // Revert on failure
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>✈️</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading itinerary details...</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Dynamic Hero Header ── */}
      <div style={{ 
        height: 'clamp(300px, 40vh, 450px)', 
        borderRadius: '32px', 
        background: trip.cover_image_url ? `url(${trip.cover_image_url}) center/cover` : 'var(--accent-gradient)',
        marginBottom: '48px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card-hover)',
        border: '1px solid var(--card-border)'
      }}>
        <div className="hero-banner" style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, var(--overlay-scrim) 0%, rgba(10, 6, 20, 0.5) 50%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(24px, 5vw, 56px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ flex: '1 1 400px' }}>
              <button
                type="button"
                className="outline"
                onClick={() => setTab('home')}
                style={{ 
                  padding: '10px 20px', 
                  marginBottom: '24px', 
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                }}
              >
                ← Back to Trips
              </button>
              <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', margin: '0 0 12px 0', fontWeight: '900', lineHeight: 1, letterSpacing: '-2px', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.35)' }}>
                {trip.title}
              </h1>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.05rem', color: 'var(--accent-light)', fontWeight: '600' }}>
                  📅 {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                </span>
                <span style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></span>
                <span style={{ fontSize: '1.05rem', color: '#fff', fontWeight: '500', opacity: 0.9 }}>
                  🌍 {stops.length} Destinations
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                onClick={() => setTab('fullItinerary')}
                style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: '700', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}
              >
                🗺️ Full Itinerary
              </button>

              <button 
                className="outline" 
                onClick={handleDeleteTrip}
                style={{ 
                  borderColor: 'var(--card-border)', 
                  color: 'var(--text-main)', 
                  background: 'rgba(248, 248, 249, 0.08)', 
                  padding: '14px 24px', 
                  fontSize: '0.9rem',
                  borderRadius: '16px'
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'start' }}>
        
        {/* ── Itinerary Timeline ── */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>📍 My Journey Timeline</h2>
            <button onClick={() => setTab('addStop')} style={{ padding: '10px 24px', borderRadius: '14px' }}>
              + Add City
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* The line */}
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute',
                left: '22px',
                top: '20px',
                bottom: '20px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--accent-light) 0%, var(--accent-subtle) 100%)'
              }}
            />

            {stops.map((stop, index) => (
              <div
                key={stop.id}
                style={{
                  display: 'flex',
                  gap: '24px',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(8px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '16px', 
                    background: 'var(--accent-gradient)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'var(--btn-text)',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px var(--btn-glow)',
                    border: '2px solid rgba(255,255,255,0.35)'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleMoveStop(index, 'up')}
                      disabled={index === 0}
                      className="outline icon-btn"
                      style={{ padding: '2px 8px', fontSize: '0.6rem', minWidth: '28px', opacity: index === 0 ? 0.2 : 1 }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStop(index, 'down')}
                      disabled={index === stops.length - 1}
                      className="outline icon-btn"
                      style={{ padding: '2px 8px', fontSize: '0.6rem', minWidth: '28px', opacity: index === stops.length - 1 ? 0.2 : 1 }}
                    >
                      ▼
                    </button>
                  </div>
                </div>
                
                <div className="glass-card" style={{ 
                  flex: 1, 
                  padding: '28px', 
                  borderRadius: '24px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'var(--card-bg-light)',
                  border: '1px solid var(--card-border)'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '800' }}>{stop.city_name}</h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem', fontWeight: '500' }}>
                        📅 {formatDate(stop.arrival_date)} — {formatDate(stop.departure_date)}
                      </p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: '6px' }}>
                        Stop {index + 1}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStopId(stop.id);
                        setTab('stopDetail');
                      }}
                      style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
                    >
                      Manage →
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDeleteStop(stop.id)}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '10px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trip Sidebar ── */}
        <div style={{ position: 'sticky', top: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'var(--card-bg-light)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '32px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Adventure Overview
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📍</div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Destinations</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stops.length} Cities</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--accent-subtle)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💰</div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Estimated Budget</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>₹{trip.budget?.toLocaleString() || 0}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '28px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Description</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                  {trip.description || "No description provided for this adventure."}
                </p>
              </div>
            </div>
          </div>

          <TripNotes tripId={tripId} />
        </div>

      </div>
    </div>
  );
};

export default TripDetail;
