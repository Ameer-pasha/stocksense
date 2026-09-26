// Member 3: Operations In-Memory State Engine
// Simulates / connects to Member 1's Stock Ledger and Member 2's Product Catalog
// Provides atomic state mutation and audit trail recording

class OperationsStore {
  constructor() {
    this.reset();
  }

  reset() {
    // Initial products with location-specific stock matching StockSense.pdf
    this.products = [
      {
        id: 'prod-001',
        sku: 'STL-ROD-01',
        name: 'Steel Rods (High Tensile 12mm)',
        category: 'Raw Materials',
        unitOfMeasure: 'kg',
        reorderLevel: 20,
        locations: [
          { warehouseId: 'wh-main', locationCode: 'Rack A (Bulk Steel & Heavy Goods)', quantity: 0 },
          { warehouseId: 'wh-main', locationCode: 'Rack B (Production Floor Staging)', quantity: 0 }
        ]
      },
      {
        id: 'prod-002',
        sku: 'CHR-ERG-02',
        name: 'Ergonomic Executive Office Chair',
        category: 'Finished Goods',
        unitOfMeasure: 'pcs',
        reorderLevel: 5,
        locations: [
          { warehouseId: 'wh-main', locationCode: 'Rack C (Finished Furniture)', quantity: 15 }
        ]
      },
      {
        id: 'prod-003',
        sku: 'BLT-HEX-03',
        name: 'Hex Bolts M8 x 40mm (Pack of 100)',
        category: 'Hardware & Fasteners',
        unitOfMeasure: 'box',
        reorderLevel: 10,
        locations: [
          { warehouseId: 'wh-main', locationCode: 'Shelf B-1 (Fasteners & Small Parts)', quantity: 50 },
          { warehouseId: 'wh-north', locationCode: 'Bay 1 (Receiving)', quantity: 0 }
        ]
      }
    ];

    // Double-entry Stock Ledger
    this.stockLedger = [];

    // Seeded Operational Stores
    const { INITIAL_RECEIPTS } = require('../receipts/initialReceipts');
    const { INITIAL_DELIVERIES } = require('../deliveries/initialDeliveries');
    const { INITIAL_TRANSFERS } = require('../transfers/initialTransfers');

    this.receipts = JSON.parse(JSON.stringify(INITIAL_RECEIPTS));
    this.deliveries = JSON.parse(JSON.stringify(INITIAL_DELIVERIES));
    this.transfers = JSON.parse(JSON.stringify(INITIAL_TRANSFERS));

    // Adjustments store
    this.adjustments = [
      {
        id: 'ADJ-2026-011',
        adjustmentNumber: 'ADJ-2026-011',
        product: 'Roxon 290 Bearings',
        productName: 'Roxon 290 Bearings',
        productId: 'PRD-000103',
        sku: 'BRG-ROX-290',
        warehouse: 'WH-NORTH',
        warehouseId: 'WH-NORTH',
        warehouseName: 'North Logistics Hub',
        locationCode: 'Bay 1 (Receiving)',
        recordedQuantity: 15,
        systemStock: 15,
        countedQuantity: 12,
        realStock: 12,
        discrepancy: -3,
        delta: -3,
        unit: 'pcs',
        reason: 'damaged',
        remarks: 'Damaged Goods Write-off',
        auditedBy: 'Ameer Pasha',
        auditor: 'Ameer Pasha',
        date: '2026-09-25 14:32',
        timestamp: '2026-09-25T14:32:00.000Z'
      },
      {
        id: 'ADJ-2026-012',
        adjustmentNumber: 'ADJ-2026-012',
        product: 'Industrial Pressure Sensor 500PSI',
        productName: 'Industrial Pressure Sensor 500PSI',
        productId: 'PRD-000102',
        sku: 'SEN-PRS-500',
        warehouse: 'WH-MAIN',
        warehouseId: 'WH-MAIN',
        warehouseName: 'Main Warehouse HQ',
        locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
        recordedQuantity: 175,
        systemStock: 175,
        countedQuantity: 180,
        realStock: 180,
        discrepancy: 5,
        delta: 5,
        unit: 'pcs',
        reason: 'found',
        remarks: 'Found Unrecorded Stock',
        auditedBy: 'Prince (Inventory Staff)',
        auditor: 'Prince',
        date: '2026-09-24 10:15',
        timestamp: '2026-09-24T10:15:00.000Z'
      }
    ];
  }

  // --- Product & Location Stock Helpers ---
  getProduct(productId) {
    return this.products.find(p => p.id === productId || p.sku === productId);
  }

  getLocationStock(productId, locationCode) {
    const product = this.getProduct(productId);
    if (!product) return 0;
    const loc = product.locations.find(l => l.locationCode === locationCode);
    return loc ? Number(loc.quantity) : 0;
  }

  updateLocationStock(productId, locationCode, newQuantity) {
    let product = this.getProduct(productId);
    if (!product) {
      product = {
        id: productId,
        sku: productId,
        name: productId,
        unitOfMeasure: 'pcs',
        locations: []
      };
      this.products.push(product);
    }

    let loc = product.locations.find(l => l.locationCode === locationCode);
    if (!loc) {
      loc = { warehouseId: 'wh-main', locationCode, quantity: Math.max(0, Number(newQuantity)) };
      product.locations.push(loc);
    } else {
      loc.quantity = Math.max(0, Number(newQuantity));
    }

    return loc.quantity;
  }

  // --- Ledger Recording (Double-Entry Audit Engine) ---
  recordLedgerEntry({
    documentType,
    documentRef,
    productId,
    sku,
    productName,
    sourceLocation,
    destLocation,
    quantityChange,
    unit,
    reason,
    performedBy
  }) {
    const entry = {
      id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      documentType,
      documentRef,
      productId,
      sku,
      productName,
      sourceLocation,
      destLocation,
      quantityChange: Number(quantityChange),
      unit: unit || 'pcs',
      reason: reason || '',
      performedBy: performedBy || 'System Operator'
    };

    this.stockLedger.unshift(entry);
    return entry;
  }

  getLedger() {
    return [...this.stockLedger];
  }
}

// Singleton instance
const operationsStore = new OperationsStore();
module.exports = { operationsStore, OperationsStore };
