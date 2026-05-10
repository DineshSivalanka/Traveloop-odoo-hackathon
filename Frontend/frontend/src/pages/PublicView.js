import React, { useEffect, useState } from 'react';
import API from '../api';
import WeatherWidget from '../components/WeatherWidget';

const PublicView = ({ tripId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/full_trip/${tripId}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [tripId]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Loading Itinerary...</h2></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Not found.</h2></div>;

  const total = data.details.reduce((acc, item) => {
    return acc + item.activities.reduce((sum, act) => sum + parseFloat(act[4] || 0), 0);
  }, 0);

  return (
    <div className="app-container animate-fade-in">
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '40px', background: 'var(--accent-gradient)', padding: '60px' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>🌍 {data.trip[2]}</h1>
        <p>{data.trip[3]}</p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'white', color: 'var(--bg)' }}>Budget: ₹{total}</span>
          <button className="outline" style={{ background: 'white', color: 'var(--bg)', border: 'none' }} onClick={() => window.print()}>
            📄 PDF
          </button>
          <button className="outline" style={{ background: '#25D366', color: 'white', border: 'none' }} onClick={() => window.open(`https://wa.me/?text=Check out my trip: ${window.location.href}`, '_blank')}>
            WhatsApp
          </button>
          <button className="outline" style={{ background: '#1DA1F2', color: 'white', border: 'none' }} onClick={() => window.open(`https://twitter.com/intent/tweet?text=Planning my next adventure! ${window.location.href}`, '_blank')}>
            Twitter
          </button>
        </div>
      </div>

      <div className="grid-layout">
        {data.details.map((item, index) => (
            <div key={index} className="glass-card animate-slide-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>📍 {item.stop[2]}</h3>
                <WeatherWidget city={item.stop[2]} />
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
              {item.activities.map((act, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{act[2]}</span>
                  <span>₹{act[4]}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicView;
