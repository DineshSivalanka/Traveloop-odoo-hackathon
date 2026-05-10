import React from 'react';

const WeatherWidget = ({ city }) => {
  // Mock weather data for common cities
  const weatherMap = {
    "London": { temp: 15, desc: "Cloudy ☁️" },
    "Paris": { temp: 18, desc: "Sunny ☀️" },
    "New York": { temp: 22, desc: "Partly Cloudy ⛅" },
    "Tokyo": { temp: 20, desc: "Rainy 🌧️" },
    "Dubai": { temp: 35, desc: "Clear ☀️" },
    "Default": { temp: 24, desc: "Clear ☀️" }
  };

  const data = weatherMap[city] || weatherMap["Default"];

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
      <span style={{ fontWeight: 'bold' }}>{data.temp}°C</span>
      <span>{data.desc}</span>
    </div>
  );
};

export default WeatherWidget;
