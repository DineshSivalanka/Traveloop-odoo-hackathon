import React, { useState } from 'react';
import API from '../api';

const CreateTrip = ({ setTab, fetchTrips }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-05-20');
  const [endDate, setEndDate] = useState('2026-05-25');
  const [budget, setBudget] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      setError("Please fill in the trip name and dates.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    const userId = localStorage.getItem("user_id");
    API.post("/trips", {
      user_id: userId,
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      budget: budget ? parseFloat(budget) : 0,
      cover_image_url: coverImage
    }).then(() => {
      setLoading(false);
      fetchTrips();
      setTab("home");
    }).catch(err => {
      console.error(err);
      setError("Failed to create trip. Please check your connection.");
      setLoading(false);
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="header-title" style={{ fontSize: '2.5rem' }}>✨ Plan New Adventure</h1>
        <p style={{ opacity: 0.6 }}>Design your journey from scratch</p>
      </header>

      <div className="glass-card" style={{ padding: '40px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Trip Name</label>
            <input 
              placeholder="e.g., European Summer Adventure" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Budget (Optional)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }}>₹</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={budget} 
                  onChange={e => setBudget(e.target.value)} 
                  style={{ paddingLeft: '35px' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Cover Image URL</label>
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/..." 
                value={coverImage} 
                onChange={e => setCoverImage(e.target.value)} 
              />
              {coverImage && (
                <div style={{ marginTop: '15px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)', height: '150px' }}>
                  <img 
                    src={coverImage} 
                    alt="Trip Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'; }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Description</label>
            <textarea 
              placeholder="What's this trip about? Share your goals, interests, or any special notes..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              style={{ 
                minHeight: '120px', 
                background: 'rgba(0,0,0,0.2)', 
                color: '#fff', 
                border: '1px solid var(--card-border)', 
                borderRadius: '12px', 
                padding: '15px',
                lineHeight: '1.6'
              }} 
            />
          </div>

          {error && (
            <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Creating Trip...' : '✨ Create Trip'}
            </button>
            <button type="button" className="outline" onClick={() => setTab("home")} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
