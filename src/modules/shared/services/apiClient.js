// StockSense API Client Adapter
// Supports seamless switching between mock storage and Prince / Ameer's Backend APIs

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== 'false'; // Default to true unless explicitly disabled

export const apiClient = {
  isMockMode: () => USE_MOCK,
  getBaseUrl: () => API_BASE_URL,

  async get(endpoint) {
    if (USE_MOCK) return null; // Let the service handle mock response
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`[StockSense API] Backend unavailable at ${endpoint}, falling back to mock:`, err.message);
      return null;
    }
  },

  async post(endpoint, data) {
    if (USE_MOCK) return null;
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`[StockSense API] Backend POST failed at ${endpoint}:`, err.message);
      return null;
    }
  },

  async put(endpoint, data) {
    if (USE_MOCK) return null;
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`[StockSense API] Backend PUT failed at ${endpoint}:`, err.message);
      return null;
    }
  },

  async delete(endpoint) {
    if (USE_MOCK) return null;
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`[StockSense API] Backend DELETE failed at ${endpoint}:`, err.message);
      return null;
    }
  }
};
