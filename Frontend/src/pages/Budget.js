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
  const tripBudget = budgetData?.trip?.budget || 0;
  const isOverBudget = tripBudget > 0 && total > tripBudget;
  const budgetPercentage = tripBudget > 0 ? Math.min((total / tripBudget) * 100, 100) : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
          💰 Budget <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Visualize your travel expenses and keep track of your spending.</p>
      </header>

      {/* ── Trip Selector ── */}
      <div className="glass-card" style={{ padding: '32px', borderRadius: '28px', marginBottom: '40px', border: '1px solid var(--card-border)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
          Select Adventure to Analyze
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {trips.length === 0 ? (
            <p style={{ opacity: 0.5, fontStyle: 'italic' }}>No trips found. Create a trip first to see analytics.</p>
          ) : (
            trips.map((trip) => (
              <button 
                key={trip.id} 
                className={selectedTripId === trip.id ? "" : "outline"} 
                onClick={() => setSelectedTripId(trip.id)}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '14px',
                  background: selectedTripId === trip.id ? 'var(--accent-gradient)' : 'transparent',
                  border: selectedTripId === trip.id ? 'none' : '1px solid var(--card-border)',
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem'
                }}
              >
                {trip.title}
              </button>
            ))
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="animate-spin" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💰</div>
          <p style={{ color: 'var(--text-muted)' }}>Calculating expenses...</p>
        </div>
      )}

      {!loading && budgetData && (
        <div className="animate-slide-up">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            
            {/* ── Main Budget Overview ── */}
            <div className="glass-card" style={{ 
              padding: '40px', 
              borderRadius: '32px', 
              textAlign: 'center',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '100px', height: '100px', background: isOverBudget ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 193, 43, 0.15)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
              <h1 style={{ 
                fontSize: '4.2rem', 
                fontWeight: '900', 
                margin: '0 0 16px 0', 
                color: isOverBudget ? 'var(--error)' : 'var(--secondary)',
                letterSpacing: '-2px',
                lineHeight: 1
              }}>
                ₹{total.toLocaleString()}
              </h1>
              
              {tripBudget > 0 && (
                <div style={{ padding: '24px', background: 'var(--glass)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget Limit: ₹{tripBudget.toLocaleString()}</span>
                    <span style={{ fontWeight: '700', color: isOverBudget ? 'var(--error)' : 'var(--accent)' }}>
                      {Math.round((total/tripBudget)*100)}%
                    </span>
                  </div>
                  <div style={{ height: '10px', background: 'var(--accent-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${budgetPercentage}%`, 
                      height: '100%', 
                      background: isOverBudget ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'var(--accent-gradient)',
                      boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)'
                    }}></div>
                  </div>
                  {isOverBudget && (
                    <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: '#f87171', fontWeight: '600' }}>
                      ⚠️ You are ₹{(total - tripBudget).toLocaleString()} over budget!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Breakdown List ── */}
            <div className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px' }}>🗺️ Cost Breakdown by City</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {budgetData.details.map((item, idx) => {
                  const cityTotal = item.activities.reduce((sum, act) => sum + parseFloat(act.estimated_cost || 0), 0);
                  const percentage = total > 0 ? (cityTotal / total) * 100 : 0;
                  return (
                    <div key={idx} className="animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
                        <div>
                          <span style={{ fontWeight: '700', fontSize: '1rem' }}>{item.stop.city_name}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.5, marginLeft: '8px' }}>({item.activities.length} acts)</span>
                        </div>
                        <span style={{ fontWeight: '800', color: 'var(--accent-light)' }}>₹{cityTotal.toLocaleString()}</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: '100%', 
                          background: 'var(--accent-gradient)',
                          opacity: 0.8 + (percentage/500)
                        }}></div>
                      </div>
                    </div>
                  );
                })}
                {budgetData.details.length === 0 && (
                  <p style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No stops added to this trip yet.</p>
                )}
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '32px', 
            padding: '24px', 
            borderRadius: '24px', 
            background: 'rgba(248, 248, 249, 0.04)', 
            border: '1px solid var(--card-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ fontSize: '2rem' }}>💡</div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong>Optimization Tip:</strong> Activities in {budgetData.details.sort((a,b) => {
                const aCost = a.activities.reduce((sum, act) => sum + parseFloat(act.estimated_cost || 0), 0);
                const bCost = b.activities.reduce((sum, act) => sum + parseFloat(act.estimated_cost || 0), 0);
                return bCost - aCost;
              })[0]?.stop.city_name || "your destinations"} account for the largest portion of your budget. Consider looking for free local alternatives!
            </p>
          </div>
        </div>
      )}

      {!budgetData && !loading && (
        <div style={{ textAlign: 'center', padding: '100px 40px', border: '1px dashed var(--card-border)', borderRadius: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.3 }}>💹</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ready to crunch the numbers?</h2>
          <p style={{ opacity: 0.4, maxWidth: '400px', margin: '16px auto' }}>Select a trip above to see your financial breakdown and budget performance.</p>
        </div>
      )}
    </div>
  );
};

export default Budget;
