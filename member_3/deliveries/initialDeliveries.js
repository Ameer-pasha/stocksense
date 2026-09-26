// Member 3: Initial Seed Data for Outbound Deliveries
// Aligned with StockSense.pdf and Frontend UI Schema

const INITIAL_DELIVERIES = [
  {
    id: 'DEL-2026-089',
    deliveryNumber: 'DEL-2026-089',
    customer: 'Tesla Gigafactory Texas',
    customerName: 'Tesla Gigafactory Texas',
    warehouse: 'WH-MAIN',
    warehouseId: 'WH-MAIN',
    warehouseName: 'Main Warehouse HQ',
    locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    deliveryDate: '2026-09-25',
    date: '2026-09-25',
    itemsDispatched: '40 x Solar Inverter V3',
    status: 'done',
    notes: 'Sales order SO-4029 fulfilled for Tesla.',
    createdBy: 'Prince (Shipping Staff)',
    items: [
      {
        productId: 'PRD-000101',
        sku: 'SLR-INV-300',
        name: 'Solar Inverter Module V3',
        productName: 'Solar Inverter Module V3',
        quantityOrdered: 40,
        quantityDelivered: 40,
        qty: 40,
        unit: 'pcs'
      }
    ],
    createdAt: '2026-09-25T11:20:00.000Z',
    updatedAt: '2026-09-25T11:20:00.000Z'
  },
  {
    id: 'DEL-2026-090',
    deliveryNumber: 'DEL-2026-090',
    customer: 'Boeing Space Logistics',
    customerName: 'Boeing Space Logistics',
    warehouse: 'WH-MAIN',
    warehouseId: 'WH-MAIN',
    warehouseName: 'Main Warehouse HQ',
    locationCode: 'Shelf B-1 (Fasteners & Small Parts)',
    deliveryDate: '2026-09-26',
    date: '2026-09-26',
    itemsDispatched: '10 x Fastener Bolts M8',
    status: 'done',
    notes: 'Urgent aerospace fastener shipment delivered.',
    createdBy: 'Prince (Shipping Staff)',
    items: [
      {
        productId: 'PRD-000107',
        sku: 'FST-TIT-M08',
        name: 'Titanium Fastener Hex Bolts M8',
        productName: 'Titanium Fastener Hex Bolts M8',
        quantityOrdered: 10,
        quantityDelivered: 10,
        qty: 10,
        unit: 'box'
      }
    ],
    createdAt: '2026-09-26T09:14:00.000Z',
    updatedAt: '2026-09-26T09:14:00.000Z'
  },
  {
    id: 'DEL-2026-091',
    deliveryNumber: 'DEL-2026-091',
    customer: 'Siemens Energy Hub',
    customerName: 'Siemens Energy Hub',
    warehouse: 'WH-SOUTH',
    warehouseId: 'WH-SOUTH',
    warehouseName: 'South Depot & Storage',
    locationCode: 'Bay 1 (Receiving)',
    deliveryDate: '2026-09-28',
    date: '2026-09-28',
    itemsDispatched: '15 x Hydraulic Actuator',
    status: 'packing',
    notes: 'Order SO-5012 packed in Bay 1, ready for dispatch inspection.',
    createdBy: 'Prince (Shipping Staff)',
    items: [
      {
        productId: 'PRD-000105',
        sku: 'ACT-HYD-040',
        name: 'Hydraulic Actuator Cylinder 40mm',
        productName: 'Hydraulic Actuator Cylinder 40mm',
        quantityOrdered: 15,
        quantityDelivered: 15,
        qty: 15,
        unit: 'pcs'
      }
    ],
    createdAt: '2026-09-26T07:00:00.000Z',
    updatedAt: '2026-09-26T07:00:00.000Z'
  },
  {
    id: 'DEL-2026-092',
    deliveryNumber: 'DEL-2026-092',
    customer: 'Amazon Robotics Center',
    customerName: 'Amazon Robotics Center',
    warehouse: 'WH-EAST',
    warehouseId: 'WH-EAST',
    warehouseName: 'East Coast Distribution',
    locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    deliveryDate: '2026-09-29',
    date: '2026-09-29',
    itemsDispatched: '30 x Rack Rails',
    status: 'draft',
    notes: 'Scheduled for warehouse picking on Monday morning.',
    createdBy: 'Prince (Shipping Staff)',
    items: [
      {
        productId: 'PRD-000106',
        sku: 'RCK-ALU-200',
        name: 'Reinforced Aluminum Rack Rails',
        productName: 'Reinforced Aluminum Rack Rails',
        quantityOrdered: 30,
        quantityDelivered: 30,
        qty: 30,
        unit: 'pcs'
      }
    ],
    createdAt: '2026-09-26T08:30:00.000Z',
    updatedAt: '2026-09-26T08:30:00.000Z'
  }
];

module.exports = { INITIAL_DELIVERIES };
