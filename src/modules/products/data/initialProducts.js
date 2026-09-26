// StockSense - Initial Product Seed Data
// Aligned with the problem statement workflow and multi-location structure

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Steel Rods (High Tensile 12mm)',
    sku: 'STL-ROD-01',
    category: 'Raw Materials',
    unitOfMeasure: 'kg',
    minStockThreshold: 30,
    totalStock: 97, // 100 received - 3 damaged
    locations: [
      { warehouseId: 'wh-main', warehouseName: 'Main Warehouse', locationCode: 'Rack A (Bulk Steel & Heavy Goods)', quantity: 77 },
      { warehouseId: 'wh-production', warehouseName: 'Production Floor', locationCode: 'Production Rack - Inbound Raw', quantity: 20 }
    ],
    costPrice: 48.50,
    sellingPrice: 72.00,
    status: 'Active',
    lastAudited: '2026-09-25T14:30:00Z'
  },
  {
    id: 'prod-002',
    name: 'Ergonomic Executive Office Chair',
    sku: 'CHR-ERG-02',
    category: 'Finished Goods',
    unitOfMeasure: 'pcs',
    minStockThreshold: 15,
    totalStock: 8, // Below minStockThreshold (LOW STOCK)
    locations: [
      { warehouseId: 'wh-main', warehouseName: 'Main Warehouse', locationCode: 'Rack C (Finished Stock & Packaged)', quantity: 8 }
    ],
    costPrice: 3200.00,
    sellingPrice: 5499.00,
    status: 'Active',
    lastAudited: '2026-09-24T11:00:00Z'
  },
  {
    id: 'prod-003',
    name: 'Hydraulic Hex Bolts M8x40mm',
    sku: 'BLT-HEX-03',
    category: 'Hardware & Fasteners',
    unitOfMeasure: 'pcs',
    minStockThreshold: 500,
    totalStock: 1850,
    locations: [
      { warehouseId: 'wh-main', warehouseName: 'Main Warehouse', locationCode: 'Rack B (Fast-moving Fasteners)', quantity: 1500 },
      { warehouseId: 'wh-production', warehouseName: 'Production Floor', locationCode: 'WIP Assembly Bay', quantity: 350 }
    ],
    costPrice: 2.20,
    sellingPrice: 4.50,
    status: 'Active',
    lastAudited: '2026-09-22T09:15:00Z'
  },
  {
    id: 'prod-004',
    name: 'Aluminum Extrusion Profiles (40x40)',
    sku: 'ALM-EXT-04',
    category: 'Raw Materials',
    unitOfMeasure: 'm',
    minStockThreshold: 40,
    totalStock: 0, // OUT OF STOCK
    locations: [
      { warehouseId: 'wh-secondary', warehouseName: 'Secondary Warehouse (WH-2)', locationCode: 'Bay 1 - Heavy Structural Storage', quantity: 0 }
    ],
    costPrice: 310.00,
    sellingPrice: 480.00,
    status: 'Active',
    lastAudited: '2026-09-26T08:00:00Z'
  },
  {
    id: 'prod-005',
    name: 'Corrugated Heavy Packaging Boxes (L)',
    sku: 'BOX-CRG-05',
    category: 'Packaging Materials',
    unitOfMeasure: 'box',
    minStockThreshold: 100,
    totalStock: 320,
    locations: [
      { warehouseId: 'wh-main', warehouseName: 'Main Warehouse', locationCode: 'Rack C (Finished Stock & Packaged)', quantity: 320 }
    ],
    costPrice: 18.00,
    sellingPrice: 28.00,
    status: 'Active',
    lastAudited: '2026-09-20T16:45:00Z'
  },
  {
    id: 'prod-006',
    name: 'Industrial Copper Wiring Spool (50m)',
    sku: 'CPR-WIR-06',
    category: 'Raw Materials',
    unitOfMeasure: 'set',
    minStockThreshold: 10,
    totalStock: 4, // Below threshold (LOW STOCK)
    locations: [
      { warehouseId: 'wh-main', warehouseName: 'Main Warehouse', locationCode: 'Rack B (Fast-moving Fasteners)', quantity: 4 }
    ],
    costPrice: 850.00,
    sellingPrice: 1250.00,
    status: 'Active',
    lastAudited: '2026-09-25T18:10:00Z'
  }
];
