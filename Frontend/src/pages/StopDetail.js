import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api';

const StopDetail = ({ stopId, tripId, setTab }) => {
  const [stop, setStop] = useState(null);
  const [masterActivities, setMasterActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popularity'); // popularity, cost_low, cost_high
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Sightseeing", "Food", "Adventure", "Culture", "Shopping", "Nightlife", "Nature"];

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
      notes: `Category: ${master.category}`
    }).then(() => {
      loadData();
    });
  };

  const handleRemoveActivity = (id) => {
    API.delete(`/activities/${id}`).then(() => {
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

  const filteredAndSortedMaster = useMemo(() => {
    let list = [...masterActivities];
    
    // Search
    if (search) {
      list = list.filter(a => 
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        a.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category
    if (filterCategory !== 'All') {
      list = list.filter(a => a.category === filterCategory);
    }

    // Sort
    if (sortBy === 'cost_low') list.sort((a, b) => a.base_cost - b.base_cost);
    if (sortBy === 'cost_high') list.sort((a, b) => b.base_cost - a.base_cost);
    
    return list;
  }, [masterActivities, search, filterCategory, sortBy]);

  const totalCost = selectedActivities.reduce((sum, a) => sum + parseFloat(a.estimated_cost || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>✨</div>
        <p style={{ color: 'var(--text-muted)' }}>Curating the best experiences for you...</p>
      </div>
    );
  }

  if (!stop) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            className="outline" 
            onClick={() => setTab('tripDetail')} 
            style={{ width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}
          >
            ←
          </button>
          <div>
            <h1 className="header-title" style={{ fontSize: '3rem' }}>
              Activities in {stop.city_name}
            </h1>
            <p className="header-subtitle">Plan your days with sightseeing, food tours, and adventures.</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Planned for:</span>
          <select 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {getStopDates().map(d => (
              <option key={d} value={d} style={{ background: '#1e1b4b' }}>
                {new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px', alignItems: 'start' }}>
        
        {/* ── Discovery Marketplace ── */}
        <div style={{ flex: 2 }}>
          
          {/* Filters Bar */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <input 
                    placeholder="Search activities..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>
                <div style={{ minWidth: '150px' }}>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ borderRadius: '12px' }}>
                    <option value="popularity">Popularity</option>
                    <option value="cost_low">Cost: Low to High</option>
                    <option value="cost_high">Cost: High to Low</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map(c => (
                  <button 
                    key={c}
                    className={filterCategory === c ? 'small' : 'small outline'}
                    onClick={() => setFilterCategory(c)}
                    style={{ borderRadius: '10px' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredAndSortedMaster.map(master => {
              const isAdded = selectedActivities.some(a => a.activity_name === master.name);
              return (
                <div key={master.id} className="glass-card animate-scale-in" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    height: '140px', 
                    background: `linear-gradient(transparent, rgba(0,0,0,0.6)), url('https://source.unsplash.com/400x300/?${master.name},travel') center/cover`,
                    position: 'relative'
                  }}>
                    <span className="badge" style={{ position: 'absolute', top: '16px', right: '16px' }}>{master.category}</span>
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '800' }}>{master.name}</h3>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      <span>⏱️ {master.duration_hours}h</span>
                      <span>💰 ₹{master.base_cost}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
                      {master.description}
                    </p>
                    <button 
                      className={isAdded ? "block outline" : "block"}
                      onClick={() => !isAdded && handleAddActivity(master)}
                      disabled={isAdded}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {isAdded ? '✓ Added to Itinerary' : 'Add Activity'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Summary Sidebar ── */}
        <div style={{ flex: 1, position: 'sticky', top: '24px' }}>
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'rgba(15, 23, 42, 0.7)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '32px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Stop Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              {selectedActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>No activities planned yet.</p>
                </div>
              ) : selectedActivities.map(activity => (
                <div key={activity.id} className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{activity.activity_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-light)' }}>
                      {new Date(activity.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ₹{activity.estimated_cost}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveActivity(activity.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(217, 70, 239, 0.1) 100%)', 
              padding: '24px', 
              borderRadius: '24px', 
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase' }}>Estimated Stop Cost</p>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>
                ₹{totalCost.toLocaleString()}
              </div>
            </div>

            <button 
              className="outline block mt-4" 
              onClick={() => setTab('tripDetail')}
              style={{ padding: '16px' }}
            >
              Done with {stop.city_name}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StopDetail;
