// StockSense API Client Adapter
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

export const apiClient = {
  getBaseUrl: () => API_BASE_URL,
  isMockMode: () => FORCE_MOCK,

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
      return null;
    }
  },

  async post(endpoint, data) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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
      return null;
    }
  },

  async put(endpoint, data) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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
      return null;
    }
  },

  async delete(endpoint) {
    if (FORCE_MOCK) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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
    }
  }
};
