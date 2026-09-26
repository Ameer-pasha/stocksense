// StockSense API Client Adapter
<<<<<<< HEAD
// Open and ready for cross-member team integration:
// Automatically detects and communicates with the backend REST API,
// with graceful fallback to mock storage when the backend server is offline.

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';
const FORCE_MOCK = import.meta.env?.VITE_USE_MOCK === 'true';

let isBackendLive = false;
let lastHealthCheck = 0;
=======
// Connects Tarun's Products, Stock Adjustments, and Alerts modules to the Backend REST API (http://localhost:5000/api)
// Gracefully falls back to local reactive storage if the backend server is offline.

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const FORCE_MOCK = import.meta.env?.VITE_USE_MOCK === 'true';

function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  const token = localStorage.getItem('token') || localStorage.getItem('stocksense_token') || localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
>>>>>>> origin/main

export const apiClient = {
  getBaseUrl: () => API_BASE_URL,
  isMockMode: () => FORCE_MOCK,

<<<<<<< HEAD
  async checkHealth() {
    if (FORCE_MOCK) return false;
    const now = Date.now();
    // Cache health result for 5 seconds to avoid spamming
    if (now - lastHealthCheck < 5000) return isBackendLive;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      isBackendLive = res.ok;
    } catch {
      isBackendLive = false;
    }
    lastHealthCheck = now;
    return isBackendLive;
  },

  async get(endpoint) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      isBackendLive = true;
      return await response.json();
    } catch {
      // Backend offline or unreachable — silently allow service to fallback to mock store
=======
  async get(endpoint) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[StockSense API] GET ${endpoint} returned status ${response.status}`);
        return null;
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.info(`[StockSense API] Backend unreachable at ${endpoint} (${err.message}), utilizing local data store.`);
>>>>>>> origin/main
      return null;
    }
  },

  async post(endpoint, data) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
<<<<<<< HEAD
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      isBackendLive = true;
      return await response.json();
    } catch {
=======

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[StockSense API] POST ${endpoint} returned status ${response.status}`);
        return null;
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.info(`[StockSense API] Backend POST failed at ${endpoint} (${err.message}), saving locally.`);
>>>>>>> origin/main
      return null;
    }
  },

  async put(endpoint, data) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
<<<<<<< HEAD
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      isBackendLive = true;
      return await response.json();
    } catch {
=======

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[StockSense API] PUT ${endpoint} returned status ${response.status}`);
        return null;
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.info(`[StockSense API] Backend PUT failed at ${endpoint} (${err.message}), saving locally.`);
>>>>>>> origin/main
      return null;
    }
  },

  async delete(endpoint) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
<<<<<<< HEAD
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      isBackendLive = true;
      return true;
    } catch {
      return null;
=======

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[StockSense API] DELETE ${endpoint} returned status ${response.status}`);
        return false;
      }

      return true;
    } catch (err) {
      console.info(`[StockSense API] Backend DELETE failed at ${endpoint} (${err.message}), updating locally.`);
      return false;
>>>>>>> origin/main
    }
  }
};
