import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const StopDetail = ({ stopId, tripId, setTab }) => {
  const [stop, setStop] = useState(null);
  const [masterActivities, setMasterActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const stopRes = await API.get(`/stops/detail/${stopId}`);
      const stopData = stopRes.data;
      setStop(stopData);
      setSelectedDate(stopData.arrival_date);

      const selectedRes = await API.get(`/activities/${stopId}`);
      setSelectedActivities(selectedRes.data || []);

      if (stopData.city_id) {
        const masterRes = await API.get(`/activities/master/city/${stopData.city_id}`);
        setMasterActivities(masterRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load stop data:', err);
    } finally {
      setLoading(false);
    }
  }, [stopId]);

  useEffect(() => {
    if (stopId) {
      loadData();
    }
  }, [stopId, loadData]);

  const handleAddActivity = (master) => {
    API.post("/activities", {
      stop_id: stopId,
      activity_name: master.name,
      activity_date: selectedDate,
      estimated_cost: master.base_cost,
      duration_hours: master.duration_hours,
      notes: `Planned: ${master.category}`
    }).then(() => {
      loadData();
    });
  };

  const getStopDates = () => {
    if (!stop) return [];
    const dates = [];
    let curr = new Date(stop.arrival_date);
    const end = new Date(stop.departure_date);
    while (curr <= end) {
      dates.push(new Date(curr).toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const handleRemoveActivity = (id) => {
    API.delete(`/activities/${id}`).then(() => {
      loadData();
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const totalCost = selectedActivities.reduce((sum, a) => sum + parseFloat(a.estimated_cost || 0), 0);

  const filteredMaster = masterActivities.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>✨</div>
        <p style={{ color: 'var(--text-muted)' }}>Curating experiences for you...</p>
      </div>
    );
  }

  if (!stop) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            className="outline" 
            onClick={() => setTab('tripDetail')} 
            style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '1.2rem' }}
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: '800', margin: 0 }}>
              Exploring <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stop.city_name}</span>
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                📅 {formatDate(stop.arrival_date)} — {formatDate(stop.departure_date)}
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.5 }}></span>
              <span style={{ fontSize: '0.95rem', color: 'var(--accent-light)', fontWeight: '600' }}>
                {selectedActivities.length} Activities Planned
              </span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
        
        {/* ── Discovery Section ── */}
        <div style={{ flex: 1.5 }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>🗓️ Schedule for Day</label>
              <select 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {getStopDates().map(d => (
                  <option key={d} value={d} style={{ background: '#1e1b4b' }}>
                    {new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: '250px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>🔍 Find Activity</label>
              <input 
                placeholder="Search things to do..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '14px 20px', borderRadius: '14px', fontSize: '0.95rem', background: 'rgba(255,255,255,0.03)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredMaster.map(master => {
              const isAdded = selectedActivities.some(a => a.activity_name === master.name);
              return (
                <div 
                  key={master.id} 
                  className="animate-scale-in" 
                  style={{ 
                    padding: '24px',
                    borderRadius: '24px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', color: 'var(--accent-light)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                        {master.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                        ⏱️ {master.duration_hours}h
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{master.name}</h3>
                    <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {master.description || `Experience the best of ${stop.city_name} with this curated activity.`}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
                      ₹{master.base_cost}
                    </div>
                    <button 
                      className={isAdded ? "outline" : ""} 
                      onClick={() => isAdded ? null : handleAddActivity(master)}
                      disabled={isAdded}
                      style={{ 
                        padding: '10px 20px', 
                        fontSize: '0.85rem', 
                        borderRadius: '12px', 
                        width: '100%',
                        background: isAdded ? 'transparent' : 'var(--accent-gradient)',
                        borderColor: isAdded ? 'rgba(52, 211, 153, 0.4)' : 'transparent',
                        color: isAdded ? '#34d399' : '#fff'
                      }}
                    >
                      {isAdded ? 'Added ✓' : 'Add to Trip'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Summary Sidebar ── */}
        <div style={{ flex: 1, position: 'sticky', top: '40px' }}>
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'rgba(15, 23, 42, 0.6)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
              Stop Itinerary
            </h2>
            
            {selectedActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', opacity: 0.4, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎫</div>
                <p style={{ fontSize: '0.9rem' }}>No activities planned yet. Start exploring!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {selectedActivities.map(activity => (
                  <div 
                    key={activity.id} 
                    className="animate-scale-in"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activity.activity_name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: '600' }}>
                        ₹{activity.estimated_cost}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRemoveActivity(activity.id)}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.08)', 
                        border: 'none', 
                        color: '#f87171', 
                        cursor: 'pointer', 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(217, 70, 239, 0.15) 100%)', 
              padding: '24px', 
              borderRadius: '24px', 
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
            }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Estimated Total for Stop</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1rem', color: 'var(--accent-light)', fontWeight: '700' }}>₹</span>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>
                  {totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              💡 <strong>Traveler's Tip:</strong> Book popular attractions in advance to save time and money!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StopDetail;
