import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const FullItinerary = ({ tripId, setTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newNote, setNewNote] = useState('');

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const itRes = await API.get(`/full_trip/${tripId}`);
      setData(itRes.data);

      const checkRes = await API.get(`/checklists/${tripId}`);
      setChecklist(checkRes.data || []);

      const noteRes = await API.get(`/notes/${tripId}`);
      setNotes(noteRes.data || []);
    } catch (err) {
      console.error(err);
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
    await API.post("/checklist", { trip_id: tripId, item_name: newItem });
    setNewItem('');
    loadAllData();
  };

  const addNote = async () => {
    if (!newNote) return;
    await API.post("/notes", { trip_id: tripId, note_text: newNote });
    setNewNote('');
    loadAllData();
  };

  const calculateTotal = () => {
    if (!data) return 0;
    return data.details.reduce((acc, item) => {
      return acc + item.activities.reduce((sum, act) => sum + parseFloat(act.estimated_cost || 0), 0);
    }, 0);
  };

  if (loading) return <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px' }}>🌍 Generating Full Itinerary...</div>;
  if (!data || !data.trip) return null;

  const totalCost = calculateTotal();

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="outline" onClick={() => setTab('tripDetail')}>← Back to Trip</button>
        <h1 className="header-title" style={{ margin: 0 }}>Full Itinerary</h1>
        <div style={{ width: '100px' }}></div>
      </header>

      <div className="glass-card" style={{ padding: '40px', marginBottom: '40px', background: 'var(--accent-gradient)', border: 0 }}>
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{data.trip.title}</h2>
        <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>{data.trip.description}</p>
        <h3 style={{ marginTop: '20px', color: '#fff' }}>Total Estimated Budget: ₹{totalCost.toLocaleString()}</h3>
      </div>

      <div className="grid-layout" style={{ gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Itinerary Column */}
        <div>
          <h2 className="column-header">🗺️ Daily Schedule</h2>
          {data.details.map((item, i) => (
            <div key={i} className="glass-card" style={{ marginBottom: '25px', padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, color: 'var(--accent)' }}>📍 {item.stop.city_name}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{item.stop.arrival_date} — {item.stop.departure_date}</span>
              </div>
              
              {item.activities.length === 0 ? (
                <p style={{ opacity: 0.5, fontStyle: 'italic' }}>No activities planned for this city.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {item.activities.map((act, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                      <span>✨ {act.activity_name}</span>
                      <span style={{ fontWeight: 'bold' }}>₹{act.estimated_cost}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Packing Checklist */}
          <div className="glass-card" style={{ padding: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>🎒 Packing Checklist</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                placeholder="Add item..." 
                value={newItem} 
                onChange={e => setNewItem(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              />
              <button onClick={addChecklistItem} style={{ padding: '8px 15px' }}>+</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checklist.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.9rem', opacity: 0.8, display: 'flex', gap: '10px' }}>
                  <input type="checkbox" checked={item.is_packed} readOnly />
                  <span>{item.item_name}</span>
                </div>
              ))}
              {checklist.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Checklist is empty.</p>}
            </div>
          </div>

          {/* Trip Notes */}
          <div className="glass-card" style={{ padding: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>📝 Trip Notes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <textarea 
                placeholder="Important info, flight details..." 
                value={newNote} 
                onChange={e => setNewNote(e.target.value)}
                style={{ minHeight: '80px', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '8px', color: '#fff' }}
              />
              <button onClick={addNote}>Save Note</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notes.map((note, idx) => (
                <div key={idx} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {note.note_text}
                </div>
              ))}
              {notes.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>No notes yet.</p>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FullItinerary;
