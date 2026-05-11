import React, { useState } from 'react';
import API, { getNetworkErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

import authBg from '../assets/auth-bg.png';

/* ── view: 'login' | 'signup' | 'forgot' ── */
const AuthPage = ({ theme = 'light', toggleTheme = () => {} }) => {
  const { login } = useAuth();
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const change = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const switchView = v => {
    setView(v);
    setError('');
    setSuccess('');
    setForgotSent(false);
    setForm({ name: '', email: '', password: '', confirm: '' });
  };

  const openForgot = () => {
    setView('forgot');
    setError('');
    setSuccess('');
    setForgotSent(false);
    setForm(p => ({ ...p, password: '', confirm: '' }));
  };

  /* ── Login ── */
  const handleLogin = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    if (!validEmail(form.email)) return setError('Enter a valid email address.');
    setLoading(true);
    const res = await login(form.email, form.password);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
    }
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
      const res = await API.post('signup', { name: form.name, email: form.email, password: form.password });
      if (res.data.user_id) {
        const r = await login(form.email, form.password);
        if (!r.success) {
          setError(r.error || 'Auto-login failed. Please log in.');
          setLoading(false);
        }
      } else {
        setError(res.data.error || 'Signup failed.');
        setLoading(false);
      }
    } catch (err) {
      setError(getNetworkErrorMessage(err) || err.response?.data?.error || 'Signup failed.');
      setLoading(false);
    }
  };

  /* ── Forgot Password ── */
  const handleForgot = async e => {
    e.preventDefault();
    if (!form.email) return setError('Please enter your email address.');
    if (!validEmail(form.email)) return setError('Enter a valid email address.');
    setLoading(true);
    setError('');
    try {
      await API.post('forgot-password', { email: form.email });
    } catch {
      /* still treat as success to avoid email enumeration */
    } finally {
      setLoading(false);
      setForgotSent(true);
    }
  };

  const linkBtn = {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    padding: 0,
    textDecoration: 'none',
    fontFamily: 'inherit',
    boxShadow: 'none',
    textTransform: 'none',
    letterSpacing: 0,
  };

  return (
    <div
      className="auth-page-root"
      style={{ '--auth-hero-image': `url("${authBg}")` }}
    >
      <button
        type="button"
        className="theme-toggle auth-page-theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="auth-page-inner">
        <div className="auth-page-card-wrap">
          <div className="auth-page-card">
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✈️</div>
                <h1
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    letterSpacing: '3px',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0,
                  }}
                >
                  TRAVELOOP
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', marginBottom: 0 }}>
                  Plan your perfect journey
                </p>
              </div>

              {view !== 'forgot' && (
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--glass)',
                    borderRadius: '10px',
                    padding: '3px',
                    marginBottom: '22px',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  {['login', 'signup'].map(v => (
                    <button
                      key={v}
                      type="button"
                      className="segment-btn"
                      onClick={() => switchView(v)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        background: view === v ? 'var(--accent-gradient)' : 'transparent',
                        border: 'none',
                        color: view === v ? 'var(--btn-text)' : 'var(--text-muted)',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        letterSpacing: '0.3px',
                        transition: 'all 0.2s ease',
                        boxShadow: 'none',
                      }}
                    >
                      {v === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              )}

              {view === 'forgot' && (
                <div className="auth-forgot-nav">
                  <button type="button" className="auth-forgot-back linklike-btn" onClick={() => switchView('login')}>
                    ← Back to sign in
                  </button>
                </div>
              )}

              {view !== 'forgot' && (
                <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
                  {view === 'login' && 'Welcome back 👋'}
                  {view === 'signup' && 'Create your account'}
                </h2>
              )}

              {view === 'forgot' && !forgotSent && (
                <div className="auth-forgot-head">
                  <div className="auth-forgot-head-icon" aria-hidden="true">
                    🔑
                  </div>
                  <h2 style={{ fontSize: '1.12rem', fontWeight: '800', margin: '0 0 8px', color: 'var(--text-main)' }}>
                    Reset your password
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                    Enter the email you used for Traveloop. If an account exists, we&apos;ll email a reset link.
                  </p>
                </div>
              )}

              {view === 'forgot' && forgotSent && (
                <div className="auth-forgot-success">
                  <div className="auth-forgot-success-icon" aria-hidden="true">
                    ✉️
                  </div>
                  <h3>Check your inbox</h3>
                  <p>
                    If an account exists for <strong style={{ color: 'var(--text-main)' }}>{form.email}</strong>, we
                    sent a password reset link. The message may take a minute to arrive.
                  </p>
                  <p className="auth-forgot-hint">Didn&apos;t get it? Look in Spam or Promotions, then try again.</p>
                  <button type="button" onClick={() => switchView('login')} style={{ padding: '12px 20px', fontSize: '0.9rem' }}>
                    Return to sign in
                  </button>
                </div>
              )}

              {error && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    color: 'var(--error)',
                  }}
                >
                  <span>⚠️</span> {error}
                </div>
              )}
              {success && view !== 'forgot' && (
                <div
                  style={{
                    background: 'rgba(5, 150, 105, 0.1)',
                    border: '1px solid rgba(5, 150, 105, 0.35)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start',
                    fontSize: '0.82rem',
                    color: 'var(--success)',
                  }}
                >
                  <span>✅</span> {success}
                </div>
              )}

              {view === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={change}
                      disabled={loading}
                      style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Password</label>
                      <button type="button" onClick={openForgot} style={{ ...linkBtn, fontSize: '0.75rem' }}>
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={form.password}
                      onChange={change}
                      disabled={loading}
                      style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                    />
                  </div>
                  <button type="submit" disabled={loading} style={{ marginTop: '6px', padding: '11px', fontSize: '0.9rem' }}>
                    {loading ? (
                      <>
                        <span className="spinner" style={{ marginRight: '8px' }} />
                        Logging in…
                      </>
                    ) : (
                      'Log In →'
                    )}
                  </button>
                </form>
              )}

              {view === 'signup' && (
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={change}
                      disabled={loading}
                      style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={change}
                      disabled={loading}
                      style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="Min. 4 characters"
                      value={form.password}
                      onChange={change}
                      disabled={loading}
                      style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirm"
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={form.confirm}
                      onChange={change}
                      disabled={loading}
                      style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                    />
                  </div>
                  <button type="submit" disabled={loading} style={{ marginTop: '6px', padding: '11px', fontSize: '0.9rem' }}>
                    {loading ? (
                      <>
                        <span className="spinner" style={{ marginRight: '8px' }} />
                        Creating account…
                      </>
                    ) : (
                      'Create Account →'
                    )}
                  </button>
                </form>
              )}

              {view === 'forgot' && !forgotSent && (
                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={change}
                      disabled={loading}
                      style={{ fontSize: '0.95rem', padding: '12px 14px' }}
                    />
                  </div>
                  <button type="submit" disabled={loading} style={{ padding: '12px', fontSize: '0.95rem', marginTop: '4px' }}>
                    {loading ? (
                      <>
                        <span className="spinner" style={{ marginRight: '8px' }} />
                        Sending link…
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>
              )}

              {view !== 'forgot' && (
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '20px', marginBottom: 0 }}>
                  By continuing you agree to our Terms of Service.
                </p>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
