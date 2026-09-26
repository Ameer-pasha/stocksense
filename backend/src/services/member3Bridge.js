// StockSense Bridge: Connecting Member 3 Domain Engines to Unified Backend & Frontend
const path = require('path');
const { receiptService } = require('../../../member_3/receipts/receiptService');
const { deliveryService } = require('../../../member_3/deliveries/deliveryService');
const { transferService } = require('../../../member_3/transfers/transferService');
const { adjustmentService } = require('../../../member_3/adjustments/adjustmentService');
const { operationsStore } = require('../../../member_3/store/operationsStore');

/**
 * Initializes Member 3 operationsStore with the standard StockSense product catalog
 * so that location-level stock queries align with master products.
 */
function seedOperationsStore(productsList) {
  if (!Array.isArray(productsList)) return;

  productsList.forEach(p => {
    let existing = operationsStore.getProduct(p.id);
    if (!existing) {
      existing = operationsStore.getProduct(p.sku);
    }

    if (!existing) {
      operationsStore.products.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        unitOfMeasure: 'units',
        reorderLevel: p.minStock || 10,
        locations: [
          { warehouseId: p.warehouse || 'WH-MAIN', locationCode: p.bin || 'Rack A (Bulk Steel & Heavy Goods)', quantity: p.stock || 0 }
        ]
      });
    } else {
      // Sync stock to existing location
      const loc = existing.locations[0];
      if (loc) {
        loc.quantity = p.stock;
      }
    }
  });
}

/**
 * Syncs updated stock back to the unified products array in app.js
 */
function syncProductStock(productsList, productId, newStock) {
  const p = productsList.find(item => item.id === productId || item.sku === productId);
  if (p) {
    p.stock = Math.max(0, Number(newStock));
    if (p.stock === 0) p.status = 'OUT_OF_STOCK';
    else if (p.stock <= p.minStock) p.status = 'LOW_STOCK';
    else p.status = 'IN_STOCK';
  }
  return p;
}

/**
 * Normalizes double-entry ledger entries for the frontend Stock History table
 */
function mapLedgerEntryToHistory(entry) {
  const pad = n => n.toString().padStart(2, '0');
  const d = entry.timestamp ? new Date(entry.timestamp) : new Date();
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  let deltaStr = `${entry.quantityChange > 0 ? '+' : ''}${entry.quantityChange} units`;
  if (entry.documentType === 'TRANSFER' || entry.documentType === 'INTERNAL_TRANSFER_OUT') {
    deltaStr = `${entry.quantityChange} (in-transit)`;
  } else if (entry.documentType === 'INTERNAL_TRANSFER_IN') {
    deltaStr = `+${entry.quantityChange} units`;
  }

  return {
    id: entry.id,
    timestamp: dateStr,
    type: entry.documentType.replace('INTERNAL_TRANSFER_OUT', 'TRANSFER').replace('INTERNAL_TRANSFER_IN', 'TRANSFER'),
    ref: entry.documentRef,
    product: entry.productName || entry.productId,
    sku: entry.sku || entry.productId,
    path: `${entry.sourceLocation} → ${entry.destLocation}`,
    delta: deltaStr,
    balance: `${entry.stockAfter !== undefined ? entry.stockAfter : (entry.quantityChange > 0 ? '+' + entry.quantityChange : entry.quantityChange)} units`,
    user: entry.performedBy || 'Ameer Pasha'
  };
}

module.exports = {
  receiptService,
  deliveryService,
  transferService,
  adjustmentService,
  operationsStore,
  seedOperationsStore,
  syncProductStock,
  mapLedgerEntryToHistory
};
