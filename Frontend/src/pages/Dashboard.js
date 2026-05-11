import React, { useEffect, useState } from 'react';
import API from '../api';
import dashboardHeroImage from '../assets/dashboard-hero.png';

const DASHBOARD_HERO_IMAGE =
  dashboardHeroImage;

const CARD_GRADIENTS = [
  'linear-gradient(135deg,#4f46e5 0%,#db2777 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#ea580c 100%)',
  'linear-gradient(135deg,#6366f1 0%,#ec4899 55%,#f97316 100%)',
  'linear-gradient(135deg,#581c87 0%,#be185d 100%)',
  'linear-gradient(135deg,#312e81 0%,#a855f7 100%)',
  'linear-gradient(135deg,#c026d3 0%,#f59e0b 100%)',
];

const Dashboard = ({ setTab, setSelectedTrip }) => {
  const [data, setData] = useState({
    trips: [], totalBudget: 0, popularCities: [], loading: true, userName: 'Traveler'
  });

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    API.get(`dashboard/${userId}`)
      .then(res => setData({
        trips:         res.data.recent_trips    || [],
        totalBudget:   res.data.total_budget    || 0,
        popularCities: res.data.popular_cities  || [],
        loading:       false,
        userName:      res.data.user_name       || 'Traveler'
      }))
      .catch(() => setData(p => ({ ...p, loading: false })));
  }, []);

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA';

  const calcDays = (s, e) => {
    if (!s || !e) return 0;
    const diff = Math.ceil((new Date(e) - new Date(s)) / 86400000);
    return diff > 0 ? diff + 1 : 1;
  };

  if (data.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>✈️</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your adventures...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px' }}>

      {/* ── Hero Banner ── */}
      <div className="hero-banner" style={{
        // Keep the gradient as a guaranteed fallback, then layer a photo behind a readable overlay.
        background: 'var(--accent-gradient-hero)',
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0.62)), url("${DASHBOARD_HERO_IMAGE}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        border: '1px solid var(--accent-subtle-border)',
        borderRadius: '24px',
        padding: 'clamp(32px, 5vw, 56px)',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 64px var(--accent-glow)',
      }}>
        {/* decorative blobs */}
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'var(--blob-a)', filter:'blur(48px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-40px', left:'40%', width:'180px', height:'180px', borderRadius:'50%', background:'var(--blob-b)', filter:'blur(48px)', pointerEvents:'none' }} />

        <div style={{ position:'relative' }}>
          <p style={{ color:'rgba(255,255,255,0.88)', fontSize:'0.8rem', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>
            Welcome back
          </p>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:'900', letterSpacing:'-1px', marginBottom:'12px', color:'#fff', textShadow:'0 2px 24px rgba(0,0,0,0.25)' }}>
            Hello, <span style={{ color:'#fef3c7' }}>
              {data.userName}!
            </span> 🌍
          </h1>
          <p style={{ color:'rgba(255,255,255,0.92)', fontSize:'1.05rem', marginBottom:'28px', maxWidth:'520px', lineHeight:'1.7' }}>
            Track your journeys, plan new adventures, and discover the world one stop at a time.
          </p>
          <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
            <button type="button" onClick={() => setTab('createTrip')} style={{ padding:'13px 28px', fontSize:'0.95rem' }}>
              ✈️ Plan New Trip
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('your-trips')?.scrollIntoView({ behavior: 'smooth' })}
              className="outline"
              style={{ padding:'13px 28px', fontSize:'0.95rem' }}
            >
              💼 View My Trips
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'20px', marginBottom:'48px' }}>
        {[
          { label:'Active Trips',     value: data.trips.length,                   icon:'🗺️', color:'var(--accent)' },
          { label:'Cities Planned',   value: data.trips.length * 3,               icon:'📍', color:'var(--secondary)' },
          { label:'Total Budget (₹)', value: `₹${data.totalBudget.toLocaleString()}`, icon:'💰', color:'var(--accent-light)' },
          { label:'Countries',        value: [...new Set(data.popularCities.map(c => c.country))].length || '—', icon:'🌐', color:'var(--success)' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding:'24px 20px', textAlign:'center', borderBottom:`3px solid ${s.color}20`, position:'relative', overflow:'hidden' }}>
            <div style={{ fontSize:'1.8rem', marginBottom:'8px' }}>{s.icon}</div>
            <p style={{ fontSize:'0.7rem', letterSpacing:'2px', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'6px' }}>{s.label}</p>
            <p style={{ fontSize:'1.8rem', fontWeight:'800', color: s.color, lineHeight:1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Your Trips ── */}
      <section id="your-trips" style={{ marginBottom:'56px', scrollMarginTop: '100px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h2 style={{ fontSize:'1.4rem', fontWeight:'700' }}>🌎 Your Trips</h2>
          <button onClick={() => setTab('createTrip')} className="outline" style={{ padding:'8px 18px', fontSize:'0.8rem' }}>
            + New Trip
          </button>
        </div>

        {data.trips.length === 0 ? (
          <div className="glass-card" style={{ padding:'72px', textAlign:'center', opacity:0.6 }}>
            <div style={{ fontSize:'3rem', marginBottom:'16px' }}>🏖️</div>
            <p style={{ fontSize:'1.1rem', marginBottom:'20px' }}>No trips yet. Start your first adventure!</p>
            <button onClick={() => setTab('createTrip')}>Plan Your First Trip</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'24px' }}>
            {data.trips.map((trip, idx) => (
              <div
                key={trip.id}
                onClick={() => { setSelectedTrip(trip.id); setTab('tripDetail'); }}
                className="animate-scale-in"
                style={{
                  borderRadius:'20px',
                  overflow:'hidden',
                  border:'1px solid var(--card-border)',
                  cursor:'pointer',
                  transition:'all 0.3s ease',
                  background:'var(--card-bg-light)',
                  boxShadow:'var(--shadow-card)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='var(--shadow-card-hover)'; e.currentTarget.style.borderColor='var(--card-border-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--shadow-card)'; e.currentTarget.style.borderColor=''; }}
              >
                {/* Cover */}
                <div style={{
                  height:'160px',
                  background: trip.cover_image_url ? `url(${trip.cover_image_url}) center/cover` : CARD_GRADIENTS[idx % CARD_GRADIENTS.length],
                  position:'relative',
                }}>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, var(--bg-secondary) 0%, transparent 60%)' }} />
                  <div style={{ position:'absolute', bottom:'12px', left:'16px', display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', padding:'3px 10px', borderRadius:'20px', fontSize:'0.72rem', border:'1px solid rgba(255,255,255,0.1)' }}>
                      📅 {calcDays(trip.start_date, trip.end_date)} days
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding:'20px' }}>
                  <h3 style={{ fontSize:'1.1rem', fontWeight:'700', marginBottom:'6px' }}>{trip.title}</h3>
                  <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'16px', lineHeight:'1.5', minHeight:'36px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {trip.description || 'No description provided.'}
                  </p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'14px', borderTop:'1px solid var(--card-border)' }}>
                    <div>
                      <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>Budget</p>
                      <p style={{ color:'var(--accent-light)', fontWeight:'700', fontSize:'1rem' }}>₹{trip.budget ? Number(trip.budget).toLocaleString() : '0'}</p>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Destination Inspiration ── */}
      {data.popularCities.length > 0 && (
        <section style={{ marginBottom:'40px' }}>
          <h2 style={{ fontSize:'1.4rem', fontWeight:'700', marginBottom:'24px' }}>✨ Destinations to Explore</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px' }}>
            {data.popularCities.slice(0, 8).map(city => (
              <div
                key={city.id}
                className="glass-card"
                onClick={() => setTab('addStop')}
                style={{ padding:'18px', display:'flex', gap:'14px', alignItems:'center', cursor:'pointer', borderRadius:'16px', transition:'all 0.25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--card-border-hover)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=''; e.currentTarget.style.transform=''; }}
              >
                <div style={{ 
                  width:'56px', 
                  height:'56px', 
                  borderRadius:'12px', 
                  background: `url('${city.image_url || `https://source.unsplash.com/100x100/?${city.name},city`}') center/cover`, 
                  border:'1px solid rgba(255,255,255,0.1)', 
                  flexShrink:0 
                }} />
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:'600', fontSize:'0.95rem', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{city.name}</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
