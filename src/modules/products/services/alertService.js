// StockSense - Alerts Service (Member: Tarun)
// Connects to Ameer's /api/alerts endpoint with fallback to client-side low stock evaluation

import { apiClient } from '../../shared/services/apiClient';

export const alertService = {
  // Fetch real-time alerts from Backend API (/api/alerts)
  async getAlerts() {
    const backendRes = await apiClient.get('/alerts');
    const items = Array.isArray(backendRes) 
      ? backendRes 
      : (backendRes?.data || backendRes?.alerts || backendRes?.items);

    if (items && Array.isArray(items)) {
      return items.map(a => ({
        id: a.id || a._id,
        type: a.type || 'LOW_STOCK',
        title: a.title || 'Stock Threshold Alert',
        message: a.message || '',
        productId: a.productId || a.product_id,
        productName: a.productName || a.product_name,
        sku: a.sku,
        currentStock: a.currentStock || a.current_stock || 0,
        minThreshold: a.minThreshold || a.min_threshold || 10,
        severity: a.severity || 'warning',
        timestamp: a.timestamp || a.createdAt || new Date().toISOString()
      }));
    }
    return null;
  }
};
