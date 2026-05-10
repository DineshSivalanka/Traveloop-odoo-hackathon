import React, { useState } from 'react';
import API from '../api';

const CreateTrip = ({ setTab, fetchTrips }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!title || !startDate || !endDate) {
      alert("Please provide at least a Trip Name, Start Date, and End Date.");
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem("user_id");

    API.post("/trips", {
      user_id: userId,
      title,
      description,
      start_date: startDate,
      end_date: endDate
    })
      .then(res => {
        setLoading(false);
        fetchTrips(); // Refresh the list of trips
        setTab("planner"); // Navigate to planner so user can add stops to the trip
      })
      .catch(err => {
        setLoading(false);
        console.error("Error creating trip:", err);
        alert("Failed to create trip. Ensure backend is running.");
      });
  };

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>✨ Create a New Trip</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
        Begin the process of creating a personalized travel plan.
      </p>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Trip Name */}
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Trip Name <span style={{ color: 'red' }}>*</span></label>
          <input 
            type="text" 
            placeholder="e.g. Summer in Europe" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>

        {/* Travel Dates */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Start Date <span style={{ color: 'red' }}>*</span></label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>End Date <span style={{ color: 'red' }}>*</span></label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>

        {/* Trip Description */}
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Description</label>
          <textarea 
            placeholder="What's the main goal or vibe of this trip?" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)',
              color: 'var(--text-light)',
              minHeight: '100px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Cover Photo Upload */}
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Cover Photo (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setCoverPhoto(e.target.files[0])}
            style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px dashed rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
          {coverPhoto && <p style={{ fontSize: '0.85rem', color: '#10b981' }}>Selected: {coverPhoto.name}</p>}
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ 
            marginTop: '10px', 
            padding: '14px', 
            fontSize: '1.1rem',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Saving...' : '💾 Save Trip'}
        </button>

      </div>
    </div>
  );
};

export default CreateTrip;
