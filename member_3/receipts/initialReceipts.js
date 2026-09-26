// Member 3: Initial Seed Data for Inbound Receipts
// Aligned with StockSense.pdf and Frontend UI Schema

const INITIAL_RECEIPTS = [
  {
    id: 'REC-2026-001',
    receiptNumber: 'REC-2026-001',
    supplier: 'Apex Global Microelectronics',
    supplierName: 'Apex Global Microelectronics',
    warehouse: 'WH-MAIN',
    warehouseId: 'WH-MAIN',
    warehouseName: 'Main Warehouse HQ',
    locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    receiptDate: '2026-09-24',
    date: '2026-09-24',
    itemsCount: 150,
    totalValue: 51000.00,
    status: 'done',
    notes: 'Purchase order PO-8821 delivery. Quality verified.',
    createdBy: 'Prince (Inventory Staff)',
    items: [
      {
        productId: 'PRD-000101',
        sku: 'SLR-INV-300',
        name: 'Solar Inverter Module V3',
        productName: 'Solar Inverter Module V3',
        quantityOrdered: 150,
        quantityReceived: 150,
        qty: 150,
        unit: 'pcs',
        cost: 210.00,
        unitPrice: 210.00
      }
    ],
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-24T10:30:00.000Z'
  },
  {
    id: 'REC-2026-002',
    receiptNumber: 'REC-2026-002',
    supplier: 'Vanderbilt Heavy Castings',
    supplierName: 'Vanderbilt Heavy Castings',
    warehouse: 'WH-NORTH',
    warehouseId: 'WH-NORTH',
    warehouseName: 'North Logistics Hub',
    locationCode: 'Bay 1 (Receiving)',
    receiptDate: '2026-09-27',
    date: '2026-09-27',
    itemsCount: 50,
    totalValue: 4475.00,
    status: 'ready',
    notes: 'PO-9104 Inbound shipment awaiting physical count at receiving dock',
    createdBy: 'Prince (Inventory Staff)',
    items: [
      {
        productId: 'PRD-000103',
        sku: 'BRG-ROX-290',
        name: 'Roxon 290 Bearings',
        productName: 'Roxon 290 Bearings',
        quantityOrdered: 50,
        quantityReceived: 50,
        qty: 50,
        unit: 'pcs',
        cost: 45.00,
        unitPrice: 45.00
      }
    ],
    createdAt: '2026-09-26T08:00:00.000Z',
    updatedAt: '2026-09-26T08:00:00.000Z'
  },
  {
    id: 'REC-2026-003',
    receiptNumber: 'REC-2026-003',
    supplier: 'Matrix Fasteners Corp',
    supplierName: 'Matrix Fasteners Corp',
    warehouse: 'WH-MAIN',
    warehouseId: 'WH-MAIN',
    warehouseName: 'Main Warehouse HQ',
    locationCode: 'Shelf B-1 (Fasteners & Small Parts)',
    receiptDate: '2026-09-30',
    date: '2026-09-30',
    itemsCount: 100,
    totalValue: 1850.00,
    status: 'draft',
    notes: 'Draft order PO-9240 for titanium fastener bolts and hardware',
    createdBy: 'Prince (Inventory Staff)',
    items: [
      {
        productId: 'PRD-000107',
        sku: 'FST-TIT-M08',
        name: 'Titanium Fastener Hex Bolts M8',
        productName: 'Titanium Fastener Hex Bolts M8',
        quantityOrdered: 100,
        quantityReceived: 100,
        qty: 100,
        unit: 'box',
        cost: 9.00,
        unitPrice: 9.00
      }
    ],
    createdAt: '2026-09-26T09:00:00.000Z',
    updatedAt: '2026-09-26T09:00:00.000Z'
  }
];

module.exports = { INITIAL_RECEIPTS };
