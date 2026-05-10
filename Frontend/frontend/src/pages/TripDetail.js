import React, { useState, useEffect } from 'react';
import API from '../api';

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
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>✈️</div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="animate-fade-in" style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div className="trip-hero" style={{ 
        minHeight: '250px', 
        width: '100%', 
        borderRadius: '24px', 
        background: trip.cover_image_url ? `url(${trip.cover_image_url}) center/cover` : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0) 80%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '25px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <button 
                className="outline" 
                onClick={() => setTab('home')}
                style={{ padding: '6px 15px', marginBottom: '15px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', fontSize: '0.8rem' }}
              >
                ← Back
              </button>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 8px 0', fontWeight: '900', lineHeight: 1.1 }}>{trip.title.toUpperCase()}</h1>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                📅 {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="outline" 
                onClick={() => setTab('fullItinerary')}
                style={{ padding: '8px 20px', background: 'var(--accent)', color: '#fff', border: 0 }}
              >
                🔥 View Full Itinerary
              </button>
              <button 
                className="outline" 
                onClick={handleDeleteTrip}
                style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Delete Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-layout" style={{ gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        {/* Itinerary Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>🗺️ Your Itinerary</h2>
            <button onClick={() => setTab('addStop')}>+ Add City</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {stops.map((stop, index) => (
              <div key={stop.id} className="item-card glass-card animate-slide-up" style={{ padding: '30px', display: 'flex', gap: '25px', position: 'relative' }}>
                <div style={{ 
                  width: '45px', 
                  height: '45px', 
                  borderRadius: '50%', 
                  background: 'var(--accent)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  flexShrink: 0,
                  boxShadow: '0 0 20px rgba(217, 70, 239, 0.4)'
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>{stop.city_name}</h3>
                      <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>
                        {formatDate(stop.arrival_date)} — {formatDate(stop.departure_date)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="outline" 
                        style={{ padding: '5px 15px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setSelectedStopId(stop.id);
                          setTab('stopDetail');
                        }}
                      >
                        Manage Activities →
                      </button>
                      <button 
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                        onClick={() => handleDeleteStop(stop.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {stops.length === 0 && (
              <div className="glass-card" style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                <p>Your itinerary is empty. Add a city to start planning!</p>
                <button className="outline" onClick={() => setTab('addStop')} style={{ marginTop: '20px' }}>Add Your First Stop</button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Stats & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-card" style={{ padding: '30px' }}>
            <h2 className="column-header" style={{ border: 0, marginBottom: '25px' }}>Trip Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.6 }}>Total Stops</span>
                <span style={{ fontWeight: 'bold' }}>{stops.length} Cities</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.6 }}>Allocated Budget</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>₹{trip.budget?.toLocaleString() || 0}</span>
              </div>
              
              <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.8 }}>Description</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.6, lineHeight: '1.6' }}>
                  {trip.description || "No description provided for this adventure."}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '30px', background: 'rgba(217, 70, 239, 0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>💡 Smart Tip</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.5' }}>
              Add activities to each stop to get a more accurate cost estimate for your trip!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
