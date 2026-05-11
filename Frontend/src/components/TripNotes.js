import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const TripNotes = ({ tripId }) => {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/notes/${tripId}`);
      setNotes(res.data || []);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) loadNotes();
  }, [tripId, loadNotes]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await API.post("/notes", {
        trip_id: tripId,
        content: content.trim()
      });
      setContent('');
      loadNotes();
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      loadNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        📝 Trip Notes & Reminders
      </h3>

      <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Jot down a reminder..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px' }}
          />
          <button 
            type="submit" 
            disabled={saving || !content.trim()}
            style={{ padding: '0 20px', borderRadius: '12px' }}
          >
            {saving ? '...' : 'Add'}
          </button>
        </div>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>Loading notes...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
          {notes.map(note => (
            <div 
              key={note.id} 
              className="animate-fade-in"
              style={{ 
                padding: '16px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => handleDelete(note.id)}
                style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px', 
                  background: 'transparent', 
                  color: 'rgba(239, 68, 68, 0.4)', 
                  padding: '4px',
                  border: 'none',
                  fontSize: '0.8rem'
                }}
              >
                ✕
              </button>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', paddingRight: '20px' }}>
                {note.content}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                🕒 {formatTime(note.created_at)}
              </span>
            </div>
          ))}
          {notes.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px' }}>
              No notes yet. Keep track of hotel info or local tips here!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TripNotes;
