import React, { useState, useEffect } from 'react';
import API from '../api';

const StopDetail = ({ stopId, tripId, setTab }) => {
  const [stop, setStop] = useState(null);
  const [cityId, setCityId] = useState(null);
  const [masterActivities, setMasterActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stopId) {
      loadData();
    }
  }, [stopId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get Stop Info
      const stopRes = await API.get(`/stops/detail/${stopId}`);
      const stopData = stopRes.data;
      setStop(stopData);

      // 2. Get Selected Activities for this stop
      const selectedRes = await API.get(`/activities/${stopId}`);
      setSelectedActivities(selectedRes.data || []);

      // 3. Find City ID by name to get master activities
      const cityRes = await API.get(`/cities/search?q=${stopData.city_name}`);
      if (cityRes.data && cityRes.data.length > 0) {
        const cityObj = cityRes.data[0];
        const cId = cityObj.id;
        setCityId(cId);
        const masterRes = await API.get(`/activities/master/city/${cId}`);
        setMasterActivities(masterRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load stop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = (master) => {
    // master: {id, city_id, name, category, base_cost, duration_hours, description}
    API.post("/activities", {
      stop_id: stopId,
      activity_name: master.name,
      activity_date: stop.arrival_date, // Default to arrival date
      estimated_cost: master.base_cost,
      duration_hours: master.duration_hours,
      notes: `Planned: ${master.category}`
    }).then(() => {
      loadData();
    });
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
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>🔍</div>
      </div>
    );
  }

  if (!stop) return null;

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <button className="outline" onClick={() => setTab('tripDetail')} style={{ padding: '8px 15px', fontSize: '0.9rem' }}>← Back</button>
        <div>
          <h1 className="header-title" style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>📍 {stop.city_name}</h1>
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>{formatDate(stop.arrival_date)} — {formatDate(stop.departure_date)}</p>
        </div>
      </header>

      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Available Activities */}
        <div className="glass-card" style={{ padding: 'clamp(15px, 3vw, 30px)' }}>
          <h2 className="column-header" style={{ border: 0, marginBottom: '20px' }}>Explore {stop.city_name}</h2>
          
          <div className="input-group" style={{ marginBottom: '25px' }}>
            <input 
              placeholder="Search activities..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredMaster.map(master => {
              const isAdded = selectedActivities.some(a => a.activity_name === master.name);
              return (
                <div key={master.id} className="item-card animate-scale-in" style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{master.name}</h3>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', opacity: 0.6, flexWrap: 'wrap' }}>
                        <span>🏷️ {master.category}</span>
                        <span>⏱️ {master.duration_hours}h</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.1rem' }}>₹{master.base_cost}</p>
                      <button 
                        className={isAdded ? "outline" : ""} 
                        onClick={() => isAdded ? null : handleAddActivity(master)}
                        disabled={isAdded}
                        style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                      >
                        {isAdded ? 'Added ✓' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Activities Itinerary */}
        <div className="glass-card" style={{ padding: 'clamp(15px, 3vw, 30px)', alignSelf: 'start' }}>
          <h2 className="column-header" style={{ border: 0, marginBottom: '20px' }}>Stop Itinerary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
            {selectedActivities.map(activity => (
              <div key={activity.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>{activity.activity_name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5 }}>₹{activity.estimated_cost}</p>
                </div>
                <button 
                  onClick={() => handleRemoveActivity(activity.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '5px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ 
            background: 'rgba(217, 70, 239, 0.1)', 
            padding: '15px', 
            borderRadius: '12px', 
            border: '1px solid rgba(217, 70, 239, 0.2)' 
          }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', opacity: 0.7 }}>Total Estimated Cost</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent)' }}>₹{totalCost.toLocaleString()}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopDetail;
