import React, { useState, useEffect } from 'react';
import API from '../api';

const PublicView = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    API.get(`/public/${token}`)
      .then(res => {
        // The /public/<token> endpoint returns the trip.
        // But we need the FULL trip (stops + activities) for a good view.
        // Let's assume we can fetch full trip if we have the trip id.
        // Actually, let's create a new backend route or adjust get_trip_by_token 
        // to return full details.
        
        // For now, let's just show the trip summary.
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
        <div className="animate-spin" style={{ fontSize: '2.5rem' }}>🌍</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem' }}>404</h1>
          <p style={{ opacity: 0.6 }}>This trip is either private or doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          height: '300px', 
          borderRadius: '24px', 
          background: `url(${data.cover_image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}) center/cover`,
          marginBottom: '32px',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '24px' }}></div>
          <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>{data.title}</h1>
            <p style={{ margin: '8px 0 0', opacity: 0.8 }}>A journey planned with Traveloop</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Trip Overview</h2>
          <p style={{ lineHeight: '1.6', opacity: 0.8, marginBottom: '24px' }}>{data.description}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>Start Date</p>
              <p style={{ fontWeight: '700' }}>{data.start_date}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>End Date</p>
              <p style={{ fontWeight: '700' }}>{data.end_date}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ opacity: 0.4, fontSize: '0.9rem', marginBottom: '20px' }}>Want to plan your own adventure?</p>
          <button style={{ padding: '12px 32px' }} onClick={() => window.location.href = '/'}>
            Get Started with Traveloop
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicView;
