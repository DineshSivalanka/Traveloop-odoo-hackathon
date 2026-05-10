import React, { useState, useEffect } from 'react';
import API from '../api';

const Profile = ({ handleLogout, setTab }) => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    setLoading(true);
    API.get(`/profile/${userId}`)
      .then(res => {
        // user: [id, name, email]
        setProfile(res.data);
        setName(res.data[1]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const userId = localStorage.getItem('user_id');
    API.put(`/profile/${userId}`, { name, password })
      .then(() => {
        setSaving(false);
        setMessage('Profile updated successfully! ✅');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(err => {
        setSaving(false);
        setMessage('Failed to update profile. ❌');
      });
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>⚙️</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          className="outline" 
          onClick={() => setTab('home')}
          style={{ padding: '8px 15px' }}
        >
          ← Back
        </button>
        <h1 className="header-title" style={{ margin: 0, fontSize: '2.5rem' }}>Profile Settings</h1>
      </header>

      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {/* Profile Edit */}
        <div className="glass-card" style={{ padding: '35px' }}>
          <h2 className="column-header" style={{ border: 0, marginBottom: '25px' }}>Personal Info</h2>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                value={profile?.[2] || ''} 
                disabled 
                style={{ opacity: 0.5, cursor: 'not-allowed', background: 'rgba(255,255,255,0.05)' }}
              />
              <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '5px' }}>Email cannot be changed for security reasons.</p>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '8px' }}>Full Name</label>
              <input 
                placeholder="Enter your name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7, marginBottom: '8px' }}>Update Password</label>
              <input 
                type="password" 
                placeholder="Leave blank to keep current" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>

            <button type="submit" disabled={saving} style={{ marginTop: '10px' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {message && (
              <div style={{ 
                padding: '12px', 
                background: message.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                border: `1px solid ${message.includes('✅') ? '#10b981' : '#ef4444'}`, 
                borderRadius: '8px', 
                color: message.includes('✅') ? '#10b981' : '#ef4444', 
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Account Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-card" style={{ padding: '35px' }}>
            <h2 className="column-header" style={{ border: 0, marginBottom: '15px' }}>Danger Zone</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '25px', lineHeight: '1.5' }}>
              Logging out will end your current session. You'll need your credentials to sign back in.
            </p>
            <button 
              className="outline" 
              onClick={handleLogout} 
              style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
            >
              Sign Out
            </button>
          </div>

          <div className="glass-card" style={{ padding: '35px', background: 'rgba(217, 70, 239, 0.03)' }}>
            <h2 className="column-header" style={{ border: 0, marginBottom: '15px' }}>Help & Support</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.5' }}>
              Having trouble with your account? Reach out to our hackathon support team.
            </p>
            <a href="mailto:support@traveloop.com" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'block', marginTop: '15px', fontWeight: 'bold' }}>
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
