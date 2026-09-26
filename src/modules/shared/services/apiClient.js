// StockSense API Client Adapter
// Open and ready for cross-member team integration:
// Automatically detects and communicates with the backend REST API,
// with graceful fallback to mock storage when the backend server is offline.

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';
const FORCE_MOCK = import.meta.env?.VITE_USE_MOCK === 'true';

let isBackendLive = false;
let lastHealthCheck = 0;

export const apiClient = {
  getBaseUrl: () => API_BASE_URL,

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
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      isBackendLive = true;
      return await response.json();
    } catch {
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
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      isBackendLive = true;
      return await response.json();
    } catch {
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
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      isBackendLive = true;
      return true;
    } catch {
      return null;
    }
  }
};
