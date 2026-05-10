import React, { useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

/* ── view: 'login' | 'signup' | 'forgot' ── */
const AuthPage = () => {
  const { login } = useAuth();
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const change = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const switchView = v => {
    setView(v);
    setError(''); setSuccess('');
    setForm({ name: '', email: '', password: '', confirm: '' });
  };

  /* ── Login ── */
  const handleLogin = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    if (!validEmail(form.email)) return setError('Enter a valid email address.');
    setLoading(true);
    const res = await login(form.email, form.password);
    if (!res.success) { setError(res.error); setLoading(false); }
  };

  /* ── Signup ── */
  const handleSignup = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) return setError('Please fill in all fields.');
    if (!validEmail(form.email)) return setError('Enter a valid email address.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 4) return setError('Password must be at least 4 characters.');
    setLoading(true);
    try {
      const res = await API.post('/signup', { name: form.name, email: form.email, password: form.password });
      if (res.data.user_id) {
        const r = await login(form.email, form.password);
        if (!r.success) { setError(r.error || 'Auto-login failed. Please log in.'); setLoading(false); }
      } else {
        setError(res.data.error || 'Signup failed.'); setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed.'); setLoading(false);
    }
  };

  /* ── Forgot Password ── */
  const handleForgot = async e => {
    e.preventDefault();
    if (!form.email) return setError('Please enter your email address.');
    if (!validEmail(form.email)) return setError('Enter a valid email address.');
    setLoading(true);
    try {
      await API.post('/forgot-password', { email: form.email });
      setSuccess('If this email exists in our system, a reset link has been sent. Check your inbox.');
    } catch {
      /* still show success to avoid email enumeration */
      setSuccess('If this email exists in our system, a reset link has been sent. Check your inbox.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared link button style ── */
  const linkBtn = {
    background: 'none', border: 'none', color: 'var(--accent)',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
    padding: 0, textDecoration: 'none', fontFamily: 'inherit',
    boxShadow: 'none', textTransform: 'none', letterSpacing: 0,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'var(--bg)',
    }}>
      {/* Background glow blobs */}
      <div style={{ position: 'fixed', top: '10%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(217,70,239,0.07)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '400px',
        background: 'rgba(15,23,42,0.85)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '20px',
        padding: 'clamp(28px, 6vw, 40px)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✈️</div>
          <h1 style={{
            fontSize: '1.3rem', fontWeight: '800', letterSpacing: '3px',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            margin: 0,
          }}>TRAVELOOP</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Plan your perfect journey</p>
        </div>

        {/* ── Tab pills ── */}
        {view !== 'forgot' && (
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px', padding: '3px', marginBottom: '22px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {['login', 'signup'].map(v => (
              <button key={v} type="button" onClick={() => switchView(v)} style={{
                flex: 1, padding: '8px', borderRadius: '8px',
                background: view === v ? 'var(--accent-gradient)' : 'transparent',
                border: 'none', color: view === v ? '#fff' : 'var(--text-muted)',
                fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                textTransform: 'capitalize', letterSpacing: '0.3px',
                transition: 'all 0.2s ease', boxShadow: 'none',
              }}>
                {v === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {/* ── View heading ── */}
        <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
          {view === 'login'  && 'Welcome back 👋'}
          {view === 'signup' && 'Create your account'}
          {view === 'forgot' && 'Reset your password 🔑'}
        </h2>
        {view === 'forgot' && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '18px', lineHeight: '1.5' }}>
            Enter the email linked to your account and we'll send a reset link.
          </p>
        )}

        {/* ── Alerts ── */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
            display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', color: '#f87171',
          }}>
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
            display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.82rem', color: '#34d399',
          }}>
            <span>✅</span> {success}
          </div>
        )}

        {/* ══════════ LOGIN FORM ══════════ */}
        {view === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Email</label>
              <input type="email" name="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={change} disabled={loading}
                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Password</label>
                <button type="button" onClick={() => switchView('forgot')} style={{ ...linkBtn, fontSize: '0.75rem' }}>
                  Forgot password?
                </button>
              </div>
              <input type="password" name="password" autoComplete="current-password"
                placeholder="Your password" value={form.password} onChange={change} disabled={loading}
                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: '6px', padding: '11px', fontSize: '0.9rem' }}>
              {loading ? <><span className="spinner" style={{ marginRight: '8px' }} />Logging in…</> : 'Log In →'}
            </button>
          </form>
        )}

        {/* ══════════ SIGNUP FORM ══════════ */}
        {view === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Full Name</label>
              <input type="text" name="name" autoComplete="name"
                placeholder="John Doe" value={form.name} onChange={change} disabled={loading}
                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Email</label>
              <input type="email" name="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={change} disabled={loading}
                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Password</label>
              <input type="password" name="password" autoComplete="new-password"
                placeholder="Min. 4 characters" value={form.password} onChange={change} disabled={loading}
                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Confirm Password</label>
              <input type="password" name="confirm" autoComplete="new-password"
                placeholder="Repeat password" value={form.confirm} onChange={change} disabled={loading}
                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: '6px', padding: '11px', fontSize: '0.9rem' }}>
              {loading ? <><span className="spinner" style={{ marginRight: '8px' }} />Creating account…</> : 'Create Account →'}
            </button>
          </form>
        )}

        {/* ══════════ FORGOT PASSWORD FORM ══════════ */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Email Address</label>
              <input type="email" name="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={change} disabled={loading}
                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: '6px', padding: '11px', fontSize: '0.9rem' }}>
              {loading ? <><span className="spinner" style={{ marginRight: '8px' }} />Sending…</> : 'Send Reset Link →'}
            </button>
            <button type="button" onClick={() => switchView('login')} style={{
              ...linkBtn, textAlign: 'center', display: 'block', width: '100%',
              padding: '6px', fontSize: '0.82rem',
            }}>
              ← Back to Login
            </button>
          </form>
        )}

        {/* ── Footer note ── */}
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '20px', marginBottom: 0 }}>
          By continuing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
