import axios from "axios";

// Fallback to local dev URL if env var is missing (must match Backend/app.py PORT, default 5000).
// If the browser shows ERR_CONNECTION_REFUSED, the API process is not running or the URL/port is wrong.
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

/** When the request never reached the server (backend down, wrong host/port, CORS blocked before response). */
export const getNetworkErrorMessage = err => {
  if (err?.response) return null;
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return `No API at ${getBaseUrl(rawUrl)} — start it: open a terminal, cd Backend, run python app.py (needs PostgreSQL). Or change REACT_APP_API_URL in Frontend/.env.`;
  }
  return null;
};

export default API;
