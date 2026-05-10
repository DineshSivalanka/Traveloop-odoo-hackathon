import React, { useState, useEffect } from 'react';
import API from '../api';

const Budget = ({ trips }) => {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTripId) {
      setLoading(true);
      API.get(`/full_trip/${selectedTripId}`)
        .then(res => {
          setBudgetData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedTripId]);

  const calculateTotal = () => {
    if (!budgetData) return 0;
    return budgetData.details.reduce((acc, item) => {
      return acc + item.activities.reduce((sum, act) => sum + parseFloat(act.estimated_cost || 0), 0);
    }, 0);
  };

  const total = calculateTotal();
  const budgetLimit = 50000; 

  return (
    <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>💰 Budget Analytics</h1>

      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <h3>Select a Trip</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
          {trips.map((trip, idx) => (
            <button key={idx} className={selectedTripId === trip.id ? "" : "outline"} onClick={() => setSelectedTripId(trip.id)}>
              {trip.title}
            </button>
          ))}
        </div>
      </div>

      {budgetData && (
        <div className="animate-slide-up">
          <div className="grid-layout">
            <div className="glass-card" style={{ borderLeft: '4px solid #10b981', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Total Cost</p>
              <h1 style={{ fontSize: '3rem', color: total > budgetLimit ? '#ef4444' : '#10b981' }}>₹{total}</h1>
            </div>

            <div className="glass-card">
              <h3>Breakdown</h3>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {budgetData.details.map((item, idx) => {
                  const cityTotal = item.activities.reduce((sum, act) => sum + parseFloat(act.estimated_cost || 0), 0);
                  const percentage = total > 0 ? (cityTotal / total) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>{item.stop.city_name}</span>
                        <span>₹{cityTotal}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
