import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const FullItinerary = ({ tripId, setTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const itRes = await API.get(`/full_trip/${tripId}`);
      setData(itRes.data);

      const checkRes = await API.get(`/checklists/${tripId}`);
      setChecklist(checkRes.data || []);

      const noteRes = await API.get(`/notes/${tripId}`);
      setNotes(noteRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      loadAllData();
    }
  }, [tripId, loadAllData]);

  const addChecklistItem = async () => {
    if (!newItem) return;
    try {
      await API.post("/checklist", { trip_id: tripId, item_name: newItem });
      setNewItem('');
      loadAllData();
    } catch (err) { console.error(err); }
  };

  const toggleCheckItem = async (id, currentStatus) => {
    try {
      await API.put(`/checklists/${id}`, { is_packed: !currentStatus });
      loadAllData();
    } catch (err) { console.error(err); }
  };

  const addNote = async () => {
    if (!newNote) return;
    try {
      await API.post("/notes", { trip_id: tripId, note_text: newNote });
      setNewNote('');
      loadAllData();
    } catch (err) { console.error(err); }
  };

  const calculateTotal = () => {
    if (!data) return 0;
    return data.details.reduce((acc, item) => {
      return acc + item.activities.reduce((sum, act) => sum + parseFloat(act.estimated_cost || 0), 0);
    }, 0);
  };

  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currDate = new Date(startDate);
    const end = new Date(endDate);
    while (currDate <= end) {
      dates.push(new Date(currDate).toISOString().split('T')[0]);
      currDate.setDate(currDate.getDate() + 1);
    }
    return dates;
  };

  const formatDateLabel = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!tripId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{ margin: '0', fontSize: '1.6rem' }}>No trip selected</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '560px' }}>
          Please open a trip from the Dashboard or Trip Detail first, then click Full Itinerary.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>🌍</div>
        <p style={{ color: 'var(--text-muted)' }}>Generating your day-wise itinerary...</p>
      </div>
    );
  }

  if (!data || !data.trip) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🧭</div>
        <h2 style={{ margin: '0', fontSize: '1.6rem' }}>Itinerary unavailable</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '560px' }}>
          {error || 'The selected trip could not be loaded. Please go back to Trip Detail and try again.'}
        </p>
      </div>
    );
  }

  const totalCost = calculateTotal();
  const tripDates = getDatesBetween(data.trip.start_date, data.trip.end_date);

  // Group everything by date
  const dayPlan = tripDates.map((date, index) => {
    // Find stops active on this date
    const stopsOnDate = data.details.filter(item => {
      const arr = new Date(item.stop.arrival_date);
      const dep = new Date(item.stop.departure_date);
      const cur = new Date(date);
      return cur >= arr && cur <= dep;
    });

    // Find activities on this date
    const activitiesOnDate = [];
    data.details.forEach(item => {
      item.activities.forEach(act => {
        if (act.activity_date === date) {
          activitiesOnDate.push({ ...act, city: item.stop.city_name });
        }
      });
    });

    return {
      day: index + 1,
      date,
      stops: stopsOnDate,
      activities: activitiesOnDate
    };
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Page Header ── */}
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="outline" onClick={() => setTab('tripDetail')} style={{ padding: '12px 24px', borderRadius: '14px' }}>
          ← Back to Overview
        </button>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>
            Full Day-Wise Itinerary
          </h1>
        </div>
      </header>

      {/* ── Trip Hero ── */}
      <div className="hero-banner" style={{ 
        padding: '48px', 
        marginBottom: '48px', 
        borderRadius: '32px',
        background: 'var(--accent-gradient-hero)',
        boxShadow: 'var(--shadow-card-hover)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--accent-subtle-border)',
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', fontSize: '15rem', opacity: 0.1 }}>🗺️</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '0 0 12px 0', lineHeight: 1, color: '#fff', textShadow: '0 2px 24px rgba(0,0,0,0.25)' }}>{data.trip.title}</h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.92)', maxWidth: '600px', marginBottom: '24px', lineHeight: 1.65 }}>{data.trip.description}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', padding: '12px 24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.35)', color: '#fff' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', marginRight: '12px' }}>Projected Cost:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>₹{totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>
        
        {/* ── Day-by-Day Timeline ── */}
        <div style={{ flex: 2 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px' }}>📅 Day-by-Day Journey</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {dayPlan.map((day) => (
              <div key={day.date} className="animate-scale-in" style={{ 
                display: 'flex', 
                gap: '24px',
                position: 'relative'
              }}>
                {/* Date Sidecar */}
                <div style={{ 
                  width: '100px', 
                  flexShrink: 0, 
                  textAlign: 'right',
                  paddingTop: '20px'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: '700', textTransform: 'uppercase' }}>Day {day.day}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{new Date(day.date).getDate()}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>

                {/* Content Card */}
                <div className="glass-card" style={{ 
                  flex: 1, 
                  padding: '32px', 
                  borderRadius: '28px',
                  background: 'var(--card-bg-light)',
                  border: '1px solid var(--card-border)'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {formatDateLabel(day.date)}
                    </h3>
                  </div>

                  {/* Locations */}
                  {day.stops.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                      {day.stops.map(s => (
                        <span key={s.stop.id} style={{ 
                          padding: '6px 12px', 
                          background: 'var(--accent-subtle)', 
                          color: 'var(--text-main)', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          fontWeight: '700',
                          border: '1px solid var(--card-border)'
                        }}>
                          📍 {s.stop.city_name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Activities */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {day.activities.length === 0 ? (
                      <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '16px', border: '1px dashed var(--card-border)', textAlign: 'center' }}>
                        <p style={{ margin: 0, opacity: 0.3, fontSize: '0.9rem', fontStyle: 'italic' }}>No specific activities scheduled.</p>
                      </div>
                    ) : (
                      day.activities.map((act) => (
                        <div key={act.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '16px', 
                          background: 'var(--card-bg-light)', 
                          borderRadius: '16px',
                          border: '1px solid var(--card-border)'
                        }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>✨ {act.activity_name}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{act.city} • {act.duration_hours}h</div>
                          </div>
                          <div style={{ fontWeight: '800', color: 'var(--accent-light)' }}>₹{act.estimated_cost}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar Tools ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Checklist */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '800' }}>🎒 Checklist</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input 
                placeholder="Add item..." 
                value={newItem} 
                onChange={e => setNewItem(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addChecklistItem()}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--card-bg-light)' }}
              />
              <button onClick={addChecklistItem} style={{ padding: '12px 20px', borderRadius: '12px' }}>+</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheckItem(item.id, item.is_packed)}
                  style={{ 
                    fontSize: '0.95rem', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: item.is_packed ? 'rgba(5, 150, 105, 0.12)' : 'var(--glass)',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: item.is_packed ? 'line-through' : 'none',
                    opacity: item.is_packed ? 0.6 : 1
                  }}
                >
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--accent)', background: item.is_packed ? 'var(--accent)' : 'transparent' }}></div>
                  <span>{item.item_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '800' }}>📝 Quick Notes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <textarea 
                placeholder="Important info..." 
                value={newNote} 
                onChange={e => setNewNote(e.target.value)}
                style={{ minHeight: '100px', padding: '16px', background: 'var(--card-bg-light)', border: '1px solid var(--card-border)', borderRadius: '16px', color: 'var(--text-main)' }}
              />
              <button onClick={addNote} style={{ borderRadius: '12px' }}>Save Note</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {notes.map((note) => (
                <div key={note.id} style={{ padding: '16px', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--card-border)', fontSize: '0.9rem' }}>
                  {note.note_text}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FullItinerary;
