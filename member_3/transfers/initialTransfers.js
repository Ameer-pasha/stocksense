// Member 3: Initial Seed Data for Internal Warehouse Transfers
// Aligned with StockSense.pdf and Frontend UI Schema

const INITIAL_TRANSFERS = [
  {
    id: 'TRF-2026-042',
    transferNumber: 'TRF-2026-042',
    source: 'WH-MAIN',
    sourceWarehouseId: 'WH-MAIN',
    sourceWarehouseName: 'Main Warehouse HQ',
    sourceLocationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    dest: 'WH-NORTH',
    destWarehouseId: 'WH-NORTH',
    destWarehouseName: 'North Logistics Hub',
    destLocationCode: 'Bay 1 (Receiving)',
    product: 'Solar Inverter Module V3',
    productId: 'PRD-000101',
    qty: 25,
    scheduledDate: '2026-09-25',
    date: '2026-09-25',
    status: 'done',
    notes: 'Fulfill North Hub regional spike. Two-phase transfer completed.',
    reason: 'Fulfill North Hub regional spike',
    createdBy: 'Ameer Pasha',
    items: [
      {
        productId: 'PRD-000101',
        sku: 'SLR-INV-300',
        name: 'Solar Inverter Module V3',
        productName: 'Solar Inverter Module V3',
        quantity: 25,
        qty: 25,
        unit: 'pcs'
      }
    ],
    createdAt: '2026-09-25T16:40:00.000Z',
    updatedAt: '2026-09-25T17:10:00.000Z'
  },
  {
    id: 'TRF-2026-043',
    transferNumber: 'TRF-2026-043',
    source: 'WH-EAST',
    sourceWarehouseId: 'WH-EAST',
    sourceWarehouseName: 'East Coast Distribution',
    sourceLocationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    dest: 'WH-MAIN',
    destWarehouseId: 'WH-MAIN',
    destWarehouseName: 'Main Warehouse HQ',
    destLocationCode: 'Rack B (Production Floor Staging)',
    product: 'Reinforced Aluminum Rack Rails',
    productId: 'PRD-000106',
    qty: 40,
    scheduledDate: '2026-09-26',
    date: '2026-09-26',
    status: 'in_transit',
    notes: 'Stock balancing across regions. Dispatched and en route.',
    reason: 'Stock balancing',
    createdBy: 'Prince (Warehouse Staff)',
    items: [
      {
        productId: 'PRD-000106',
        sku: 'RCK-ALU-200',
        name: 'Reinforced Aluminum Rack Rails',
        productName: 'Reinforced Aluminum Rack Rails',
        quantity: 40,
        qty: 40,
        unit: 'pcs'
      }
    ],
    createdAt: '2026-09-26T09:00:00.000Z',
    updatedAt: '2026-09-26T09:30:00.000Z'
  }
];

module.exports = { INITIAL_TRANSFERS };
