import axios from "axios";

// Fallback to local dev URL if env var is missing
const rawUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

// Ensure the URL always ends with /api/ for consistent routing
const getBaseUrl = (url) => {
  let clean = url.trim();
  if (clean.endsWith('/')) clean = clean.slice(0, -1);
  if (!clean.endsWith('/api')) clean = `${clean}/api`;
  return `${clean}/`;
};

const API = axios.create({
  baseURL: getBaseUrl(rawUrl),
  headers: {
    'Content-Type': 'application/json'
  }
});

export default API;
