// StockSense - Shared Stock Ledger Service
// Centralized movement log - Shared between Tarun (Adjustments), Prince (Receipts/Deliveries), and Ameer (Transfers/Ledger)

import { apiClient } from './apiClient';

const LEDGER_STORAGE_KEY = 'stocksense_stock_ledger';

export const stockLedgerService = {
  getLedger() {
    const stored = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse ledger from storage', e);
      }
    }
    // Initial mock ledger entries
    const initial = [
      {
        id: 'LEDGER-001',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        documentType: 'RECEIPT',
        documentRef: 'REC-2026-001',
        productId: 'prod-001',
        sku: 'STL-ROD-01',
        productName: 'Steel Rods (High Tensile 12mm)',
        sourceLocation: 'Vendor: Tata Steel Works',
        destLocation: 'Main Warehouse - Rack A',
        quantityChange: +100,
        unit: 'kg',
        reason: 'Vendor Receipt purchase order PO-8821',
        performedBy: 'Prince (Inventory Staff)'
      },
      {
        id: 'LEDGER-002',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        documentType: 'INTERNAL_TRANSFER',
        documentRef: 'TRF-2026-001',
        productId: 'prod-001',
        sku: 'STL-ROD-01',
        productName: 'Steel Rods (High Tensile 12mm)',
        sourceLocation: 'Main Warehouse - Rack A',
        destLocation: 'Production Floor - Staging',
        quantityChange: 0, // location transfer
        unit: 'kg',
        reason: 'Material requisition for Frame Assembly',
        performedBy: 'Ameer (Warehouse Staff)'
      },
      {
        id: 'LEDGER-003',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        documentType: 'DELIVERY',
        documentRef: 'DEL-2026-001',
        productId: 'prod-002',
        sku: 'CHR-ERG-02',
        productName: 'Ergonomic Executive Office Chair',
        sourceLocation: 'Main Warehouse - Rack C',
        destLocation: 'Customer: TechCorp HQ',
        quantityChange: -10,
        unit: 'pcs',
        reason: 'Sales Order fulfillment SO-4029',
        performedBy: 'Prince (Shipping Staff)'
      }
    ];
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },

  async logEntry(entry) {
    // 1. Try real API endpoint if Prince/Ameer backend is up
    const backendResult = await apiClient.post('/stock-ledger', entry);
    if (backendResult) return backendResult;

    // 2. Fallback to LocalStorage ledger
    const ledger = this.getLedger();
    const newEntry = {
      id: `LEDGER-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    const updated = [newEntry, ...ledger];
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom browser event so any listening module updates immediately
    window.dispatchEvent(new CustomEvent('stocksense:ledger_updated', { detail: newEntry }));

    return newEntry;
  }
};
