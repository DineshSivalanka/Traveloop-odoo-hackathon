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
        setProfile(res.data);
        setName(res.data.name); // Using the object keys from backend response
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>⚙️</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
            ⚙️ Account <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Settings</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and security preferences.</p>
        </div>
        <button 
          className="outline" 
          onClick={() => setTab('home')}
          style={{ padding: '12px 24px', borderRadius: '14px' }}
        >
          ← Back to Dashboard
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '30px', 
              background: 'var(--accent-gradient)', 
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#fff',
              fontWeight: '800',
              boxShadow: '0 16px 32px rgba(99, 102, 241, 0.3)',
              border: '4px solid rgba(255,255,255,0.1)'
            }}>
              {name?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>{name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{profile?.email}</p>
          </div>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Full Name</label>
              <input 
                placeholder="Enter your name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
                style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                style={{ opacity: 0.4, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: '14px' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>New Password</label>
              <input 
                type="password" 
                placeholder="Leave blank to keep current" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <button type="submit" disabled={saving} style={{ padding: '16px', fontSize: '1rem', marginTop: '8px' }}>
              {saving ? 'Updating...' : 'Update Profile'}
            </button>

            {message && (
              <div className="animate-scale-in" style={{ 
                padding: '14px', 
                background: message.includes('✅') ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                border: `1px solid ${message.includes('✅') ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
                borderRadius: '12px', 
                color: message.includes('✅') ? '#34d399' : '#f87171', 
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Sidebar Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>🚪 Security</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Signing out will end your current session. You'll need to log in again to access your trips.
            </p>
            <button 
              className="outline" 
              onClick={handleLogout} 
              style={{ width: '100%', padding: '14px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
            >
              Sign Out
            </button>
          </div>

          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(217, 70, 239, 0.05) 100%)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>🆘 Support</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Need help with your account or have a feature request? Our team is ready to help.
            </p>
            <a 
              href="mailto:support@traveloop.com" 
              style={{ 
                color: 'var(--accent-light)', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontWeight: '700',
                fontSize: '0.95rem'
              }}
            >
              Contact Support Team <span style={{ fontSize: '1.2rem' }}>→</span>
            </a>
          </div>

          <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>
            Traveloop v1.0.0-hackathon<br/>
            Made with ❤️ for the world
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
