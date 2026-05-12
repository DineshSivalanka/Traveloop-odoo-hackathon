import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const Profile = ({ handleLogout, setTab }) => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savedCities, setSavedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadProfile = useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    setLoading(true);
    try {
      const res = await API.get(`/profile/${userId}`);
      setProfile(res.data);
      setName(res.data.name);
      setAvatarUrl(res.data.avatar_url || '');

      const savedRes = await API.get(`/saved/${userId}`);
      setSavedCities(savedRes.data || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdate = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const userId = localStorage.getItem('user_id');
    API.put(`/profile/${userId}`, { name, password, avatar_url: avatarUrl })
      .then(() => {
        setSaving(false);
        setMessage('Profile updated successfully! ✅');
        setTimeout(() => setMessage(''), 3000);
        loadProfile();
      })
      .catch(err => {
        setSaving(false);
        setMessage('Failed to update profile. ❌');
      });
  };

  const handleDeleteAccount = () => {
    const userId = localStorage.getItem('user_id');
    API.delete(`/profile/${userId}`)
      .then(() => {
        handleLogout();
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete account.');
      });
  };

  const handleRemoveSaved = (cityId) => {
    const userId = localStorage.getItem('user_id');
    API.delete(`/saved/${userId}/${cityId}`)
      .then(() => {
        loadProfile();
      })
      .catch(err => console.error(err));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>⚙️</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
            ⚙️ Account <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Settings</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal information, preferences, and saved destinations.</p>
        </div>
        <button 
          className="outline" 
          onClick={() => setTab('home')}
          style={{ padding: '12px 24px', borderRadius: '14px' }}
        >
          ← Back to Dashboard
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px', alignItems: 'start' }}>
        
        {/* ── Main Settings Form ── */}
        <div className="glass-card" style={{ padding: '40px', borderRadius: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '40px', 
              background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'var(--accent-gradient)', 
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              color: 'var(--btn-text)',
              fontWeight: '800',
              boxShadow: '0 20px 48px var(--btn-glow)',
              border: '4px solid var(--card-border)',
              overflow: 'hidden'
            }}>
              {!avatarUrl && name?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>{name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{profile?.email}</p>
          </div>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Full Name</label>
                <input 
                  placeholder="Enter your name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  style={{ padding: '14px 18px', borderRadius: '14px', background: 'var(--card-bg-light)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Avatar URL</label>
              <input 
                placeholder="https://images.com/my-photo.jpg" 
                value={avatarUrl} 
                onChange={e => setAvatarUrl(e.target.value)} 
                style={{ padding: '14px 18px', borderRadius: '14px', background: 'var(--card-bg-light)' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Email Address (Read Only)</label>
              <input 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                style={{ opacity: 0.4, cursor: 'not-allowed', background: 'var(--glass)', padding: '14px 18px', borderRadius: '14px' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Update Password</label>
              <input 
                type="password" 
                placeholder="Leave blank to keep current" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ padding: '14px 18px', borderRadius: '14px', background: 'var(--card-bg-light)' }}
              />
            </div>

            <button type="submit" disabled={saving} style={{ padding: '18px', fontSize: '1rem', marginTop: '8px', boxShadow: '0 12px 36px var(--accent-glow)' }}>
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>

            {message && (
              <div className="animate-scale-in" style={{ 
                padding: '14px', 
                background: message.includes('✅') ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                border: `1px solid ${message.includes('✅') ? 'rgba(5, 150, 105, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`, 
                borderRadius: '12px', 
                color: message.includes('✅') ? 'var(--success)' : 'var(--error)', 
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* ── Sidebar: Saved & Danger ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Saved Destinations */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px' }}>💖 Saved Destinations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedCities.length === 0 ? (
                <p style={{ opacity: 0.4, fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  No saved cities yet. Start hearting destinations!
                </p>
              ) : (
                savedCities.map(city => (
                  <div key={city.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--glass)', padding: '12px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `url(${city.image_url || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200'}) center/cover` }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{city.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5 }}>{city.country}</p>
                    </div>
                    <button
                      type="button"
                      className="linklike-btn"
                      onClick={() => handleRemoveSaved(city.id)}
                      style={{ border: 'none', color: 'var(--accent)', padding: '8px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', border: '1px solid var(--accent-subtle-border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--accent)' }}>⚠️ Danger Zone</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Deleting your account is permanent. All your trips, stops, and activities will be lost forever.
            </p>
            
            {!showDeleteConfirm ? (
              <button 
                className="outline" 
                onClick={() => setShowDeleteConfirm(true)} 
                style={{ width: '100%', padding: '14px', borderColor: 'rgba(220, 38, 38, 0.45)', color: 'var(--error)' }}
              >
                Delete My Account
              </button>
            ) : (
              <div className="animate-shake" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f87171', textAlign: 'center' }}>Are you absolutely sure?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleDeleteAccount} 
                    style={{ flex: 1, background: 'var(--accent-gradient)', padding: '12px', fontSize: '0.85rem', color: 'var(--btn-text)' }}
                  >
                    Yes, Delete
                  </button>
                  <button 
                    className="outline" 
                    onClick={() => setShowDeleteConfirm(false)} 
                    style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
