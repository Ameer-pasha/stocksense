// StockSense - Seed Data for Stock Adjustments

export const INITIAL_ADJUSTMENTS = [
  {
    id: 'ADJ-2026-001',
    timestamp: '2026-09-25T16:20:00Z',
    productId: 'prod-001',
    productName: 'Steel Rods (High Tensile 12mm)',
    sku: 'STL-ROD-01',
    warehouseId: 'wh-main',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    recordedQuantity: 80,
    countedQuantity: 77,
    discrepancy: -3,
    unit: 'kg',
    reason: 'Damaged',
    remarks: '3 kg steel rods bent and corroded during transit - scrapped per QC inspection.',
    auditedBy: 'Tarun (Inventory Lead)'
  },
  {
    id: 'ADJ-2026-002',
    timestamp: '2026-09-24T14:15:00Z',
    productId: 'prod-002',
    productName: 'Ergonomic Executive Office Chair',
    sku: 'CHR-ERG-02',
    warehouseId: 'wh-main',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack C (Finished Stock & Packaged)',
    recordedQuantity: 10,
    countedQuantity: 8,
    discrepancy: -2,
    unit: 'pcs',
    reason: 'Counting Error',
    remarks: 'Dispatched 2 chairs earlier without scan completion. Adjusted after physical audit.',
    auditedBy: 'Tarun (Inventory Lead)'
  },
  {
    id: 'ADJ-2026-003',
    timestamp: '2026-09-23T11:00:00Z',
    productId: 'prod-003',
    productName: 'Hydraulic Hex Bolts M8x40mm',
    sku: 'BLT-HEX-03',
    warehouseId: 'wh-production',
    warehouseName: 'Production Floor',
    locationCode: 'WIP Assembly Bay',
    recordedQuantity: 300,
    countedQuantity: 350,
    discrepancy: +50,
    unit: 'pcs',
    reason: 'Found Stock',
    remarks: 'Unopened box recovered from assembly drawer during deep clean.',
    auditedBy: 'Tarun (Inventory Lead)'
  }
];
