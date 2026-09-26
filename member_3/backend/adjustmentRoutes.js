// Member 3: Stock Adjustments Express Router
const express = require('express');
const router = express.Router();

let adjustments = [
  {
    id: 'ADJ-2026-001',
    timestamp: new Date().toISOString(),
    productId: 'prod-001',
    productName: 'Steel Rods (High Tensile 12mm)',
    sku: 'STL-ROD-01',
    warehouseId: 'wh-main',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    recordedQuantity: 40,
    countedQuantity: 37,
    discrepancy: -3,
    unit: 'kg',
    reason: 'damaged',
    remarks: '3 kg bent rods discovered during physical inspection',
    auditedBy: 'Tarun (Inventory Lead)'
  }
];

// GET /api/adjustments
router.get('/', (req, res) => {
  const { warehouse_id, product_id } = req.query;
  let result = [...adjustments];
  if (warehouse_id) result = result.filter(a => a.warehouseId === warehouse_id);
  if (product_id) result = result.filter(a => a.productId === product_id);
  res.json({ success: true, count: result.length, data: result });
});

// POST /api/adjustments
router.post('/', (req, res) => {
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
    auditedBy
  } = req.body;

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
    discrepancy,
    unit: unit || 'pcs',
    reason: reason || 'Audit',
    remarks: remarks || '',
    auditedBy: auditedBy || 'Staff'
  };

  adjustments.unshift(adjustmentRecord);
  res.status(201).json({
    success: true,
    message: 'Stock adjustment recorded and logged in Stock Ledger',
    data: adjustmentRecord
  });
});

module.exports = router;
