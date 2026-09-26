// StockSense - Shared Warehouses and Location Constants
// Compatible with Ameer's Internal Transfers & Prince's Receipts/Deliveries

export const WAREHOUSES = [
  {
    id: 'wh-main',
    name: 'Main Warehouse',
    code: 'MWH-01',
    description: 'Central distribution and bulk receiving depot',
    locations: [
      { id: 'loc-mw-rack-a', code: 'Rack A (Bulk Steel & Heavy Goods)', capacity: 5000 },
      { id: 'loc-mw-rack-b', code: 'Rack B (Fast-moving Fasteners)', capacity: 2500 },
      { id: 'loc-mw-rack-c', code: 'Rack C (Finished Stock & Packaged)', capacity: 3000 },
    ]
  },
  {
    id: 'wh-production',
    name: 'Production Floor',
    code: 'PROD-02',
    description: 'Assembly line and active manufacturing staging racks',
    locations: [
      { id: 'loc-pf-staging', code: 'Production Rack - Inbound Raw', capacity: 1200 },
      { id: 'loc-pf-wip', code: 'WIP Assembly Bay', capacity: 800 },
      { id: 'loc-pf-outbound', code: 'Finished Assembly Racks', capacity: 1500 }
    ]
  },
  {
    id: 'wh-secondary',
    name: 'Secondary Warehouse (WH-2)',
    code: 'SWH-03',
    description: 'Overflow and regional buffer storage',
    locations: [
      { id: 'loc-sw-bay1', code: 'Bay 1 - Heavy Structural Storage', capacity: 4000 },
      { id: 'loc-sw-bay2', code: 'Bay 2 - Ancillary & Spare Components', capacity: 2000 }
    ]
  }
];

export const CATEGORIES = [
  'Raw Materials',
  'Hardware & Fasteners',
  'Finished Goods',
  'Packaging Materials',
  'Tools & Equipment',
  'Safety & Consumables'
];

export const UNITS_OF_MEASURE = [
  { code: 'kg', label: 'Kilograms (kg)' },
  { code: 'pcs', label: 'Pieces (pcs)' },
  { code: 'box', label: 'Boxes (box)' },
  { code: 'm', label: 'Meters (m)' },
  { code: 'ltr', label: 'Liters (ltr)' },
  { code: 'set', label: 'Sets (set)' }
];
