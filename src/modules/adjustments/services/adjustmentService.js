// StockSense - Stock Adjustment Service
// Reconciles Physical Count vs System Count, updates Products, and writes to Stock Ledger

import { apiClient } from '../../shared/services/apiClient';
import { productService } from '../../products/services/productService';
import { stockLedgerService } from '../../shared/services/stockLedgerService';
import { INITIAL_ADJUSTMENTS } from '../data/initialAdjustments';

const ADJUSTMENTS_STORAGE_KEY = 'stocksense_adjustments_data';

export const adjustmentService = {
  async getAdjustments() {
    // 1. Try backend API
    const backendData = await apiClient.get('/adjustments');
    if (backendData && Array.isArray(backendData)) {
      localStorage.setItem(ADJUSTMENTS_STORAGE_KEY, JSON.stringify(backendData));
      return backendData;
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(ADJUSTMENTS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing adjustments from storage', e);
      }
    }

    // 3. Fallback to seed data
    localStorage.setItem(ADJUSTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_ADJUSTMENTS));
    return INITIAL_ADJUSTMENTS;
  },

  _saveLocal(list) {
    localStorage.setItem(ADJUSTMENTS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('stocksense:adjustments_updated', { detail: list }));
  },

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

    // 1. Try Backend API
    const backendResult = await apiClient.post('/adjustments', adjustmentRecord);

    // 2. Update the actual Product stock in that location
    await productService.applyLocationAdjustment(productId, locationCode, countedQuantity);

    // 3. Log into Ameer's Stock Ledger for total audit traceability
    await stockLedgerService.logEntry({
      documentType: 'ADJUSTMENT',
      documentRef: adjustmentRecord.id,
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
    const updatedList = [adjustmentRecord, ...existing];
    this._saveLocal(updatedList);

    return adjustmentRecord;
  }
};
