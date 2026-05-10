import React, { useState } from 'react';
import API from '../api';

const CreateTrip = ({ setTab, fetchTrips }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 5*86400000).toISOString().split('T')[0]);
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
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', marginBottom: '8px' }}>
          ✨ Plan Your <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Next Adventure</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Enter your journey details to start planning.</p>
      </header>

      <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 48px)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="form-group">
            <label style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>Trip Title</label>
            <input 
              placeholder="e.g., Summer in Tokyo 🌸" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
              style={{ fontSize: '1.1rem', padding: '16px 20px', borderRadius: '16px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                required
                style={{ padding: '14px 18px', borderRadius: '14px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                required
                style={{ padding: '14px 18px', borderRadius: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>Budget Estimation (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', fontWeight: '600' }}>₹</span>
                <input 
                  type="number" 
                  placeholder="50,000" 
                  value={budget} 
                  onChange={e => setBudget(e.target.value)} 
                  style={{ padding: '14px 18px 14px 38px', borderRadius: '14px' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>Cover Image URL</label>
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/photo-..." 
                value={coverImage} 
                onChange={e => setCoverImage(e.target.value)} 
                style={{ padding: '14px 18px', borderRadius: '14px' }}
              />
            </div>
          </div>

          {coverImage && (
            <div className="animate-scale-in" style={{ 
              borderRadius: '20px', 
              overflow: 'hidden', 
              border: '2px solid rgba(99, 102, 241, 0.3)', 
              height: '220px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}>
              <img 
                src={coverImage} 
                alt="Trip Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'; }}
              />
            </div>
          )}

          <div className="form-group">
            <label style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>Trip Description</label>
            <textarea 
              placeholder="Tell us more about your travel plans, goals, or dreams..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              style={{ 
                minHeight: '140px', 
                background: 'rgba(0,0,0,0.25)', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '16px', 
                padding: '18px',
                lineHeight: '1.6',
                fontSize: '1rem'
              }} 
            />
          </div>

          {error && (
            <div className="animate-shake" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171', fontSize: '0.9rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button type="submit" disabled={loading} style={{ flex: '2 1 200px', padding: '16px', fontSize: '1rem' }}>
              {loading ? (
                <><span className="animate-spin" style={{ marginRight: '10px' }}>⏳</span> Creating...</>
              ) : (
                '🚀 Create My Trip'
              )}
            </button>
            <button type="button" className="outline" onClick={() => setTab("home")} style={{ flex: '1 1 150px', padding: '16px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
