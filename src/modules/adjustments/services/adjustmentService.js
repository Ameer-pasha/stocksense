// StockSense - Stock Adjustment Service
// Reconciles Physical Count vs System Count, updates Products, and writes to /api/adjustments & Stock Ledger

import { apiClient } from '../../shared/services/apiClient';
import { productService } from '../../products/services/productService';
import { stockLedgerService } from '../../shared/services/stockLedgerService';
import { INITIAL_ADJUSTMENTS } from '../data/initialAdjustments';

const ADJUSTMENTS_STORAGE_KEY = 'stocksense_adjustments_data';

function normalizeAdjustment(a) {
  if (!a) return null;
  return {
    id: a.id || a._id || `ADJ-${Date.now()}`,
    timestamp: a.timestamp || a.createdAt || a.created_at || new Date().toISOString(),
    productId: a.productId || a.product_id || a.product,
    productName: a.productName || a.product_name || 'Item',
    sku: (a.sku || '').toUpperCase(),
    warehouseId: a.warehouseId || a.warehouse_id || 'wh-main',
    warehouseName: a.warehouseName || a.warehouse_name || 'Main Warehouse',
    locationCode: a.locationCode || a.location_code || 'Rack A',
    recordedQuantity: Number(a.recordedQuantity ?? a.recorded_quantity ?? 0),
    countedQuantity: Number(a.countedQuantity ?? a.counted_quantity ?? 0),
    discrepancy: Number(a.discrepancy ?? (Number(a.countedQuantity || 0) - Number(a.recordedQuantity || 0))),
    unit: a.unit || a.unitOfMeasure || 'pcs',
    reason: a.reason || 'General Count',
    remarks: a.remarks || '',
    auditedBy: a.auditedBy || a.audited_by || 'Tarun (Inventory Lead)'
  };
}

export const adjustmentService = {
  // Fetch all stock adjustments from Backend API (/api/adjustments)
  async getAdjustments() {
    // 1. Try backend API
    const backendRes = await apiClient.get('/adjustments');
    const items = Array.isArray(backendRes) 
      ? backendRes 
      : (backendRes?.data || backendRes?.adjustments || backendRes?.items);

    if (items && Array.isArray(items)) {
      const normalized = items.map(normalizeAdjustment);
      localStorage.setItem(ADJUSTMENTS_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(ADJUSTMENTS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local).map(normalizeAdjustment);
      } catch (e) {
        console.error('Error parsing adjustments from storage', e);
      }
    }

    // 3. Fallback to seed data
    const seeds = INITIAL_ADJUSTMENTS.map(normalizeAdjustment);
    localStorage.setItem(ADJUSTMENTS_STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  },

  _saveLocal(list) {
    localStorage.setItem(ADJUSTMENTS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('stocksense:adjustments_updated', { detail: list }));
  },

  // Record a stock adjustment and sync to /api/adjustments
  async recordAdjustment(adjustmentInput) {
    const {
      productId,
      productName,
      sku,
      warehouseId,
      warehouseName,
      locationCode,
      recordedQuantity,
      countedQuantity,
      unit,
      reason,
      remarks,
      auditedBy = 'Tarun (Inventory Lead)'
    } = adjustmentInput;

    const discrepancy = Number(countedQuantity) - Number(recordedQuantity);

    const adjustmentRecord = {
      id: `ADJ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      productId,
      productName,
      sku,
      warehouseId,
      warehouseName,
      locationCode,
      recordedQuantity: Number(recordedQuantity),
      countedQuantity: Number(countedQuantity),
      discrepancy: discrepancy,
      unit,
      reason,
      remarks: remarks || '',
      auditedBy
    };

    // 1. Post to Backend API (/api/adjustments)
    const backendResult = await apiClient.post('/adjustments', adjustmentRecord);
    const saved = backendResult?.data || backendResult?.adjustment || backendResult;
    const finalRecord = saved && saved.id ? normalizeAdjustment(saved) : adjustmentRecord;

    // 2. Update the product's physical stock in that location
    await productService.applyLocationAdjustment(productId, locationCode, countedQuantity);

    // 3. Log into Ameer's Stock Ledger for total audit traceability
    await stockLedgerService.logEntry({
      documentType: 'ADJUSTMENT',
      documentRef: finalRecord.id,
      productId,
      sku,
      productName,
      sourceLocation: `${warehouseName} - ${locationCode}`,
      destLocation: discrepancy >= 0 ? 'Inventory Gain' : 'Inventory Loss / Scrap',
      quantityChange: discrepancy,
      unit,
      reason: `Physical count reconciliation (${reason}): ${remarks || 'Stock corrected'}`,
      performedBy: auditedBy
    });

    // 4. Save to local adjustments history
    const existing = await this.getAdjustments();
    const updatedList = [finalRecord, ...existing];
    this._saveLocal(updatedList);

    return finalRecord;
  }
};
