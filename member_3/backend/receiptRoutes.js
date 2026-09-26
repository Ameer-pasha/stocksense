// Member 3: Receipts Express Router
const express = require('express');
const router = express.Router();

// Mock in-memory store for standalone backend testing
let receipts = [
  {
    id: 'REC-2026-001',
    receiptNumber: 'REC-2026-001',
    supplierName: 'Tata Steel Works',
    warehouseId: 'wh-main',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    receiptDate: '2026-09-25',
    status: 'done',
    notes: 'Purchase order PO-8821 delivery. Quality verified.',
    createdBy: 'Prince (Inventory Staff)',
    items: [
      {
        productId: 'prod-001',
        sku: 'STL-ROD-01',
        productName: 'Steel Rods (High Tensile 12mm)',
        quantityOrdered: 100,
        quantityReceived: 100,
        unit: 'kg',
        unitPrice: 45.50
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// GET /api/receipts
router.get('/', (req, res) => {
  const { status, warehouseId } = req.query;
  let result = [...receipts];
  if (status) result = result.filter(r => r.status.toLowerCase() === status.toLowerCase());
  if (warehouseId) result = result.filter(r => r.warehouseId === warehouseId);
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/receipts/:id
router.get('/:id', (req, res) => {
  const receipt = receipts.find(r => r.id === req.params.id || r.receiptNumber === req.params.id);
  if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
  res.json({ success: true, data: receipt });
});

// POST /api/receipts
router.post('/', (req, res) => {
  const nextNum = (receipts.length + 1).toString().padStart(3, '0');
  const receiptNumber = `REC-${new Date().getFullYear()}-${nextNum}`;
  const newReceipt = {
    id: receiptNumber,
    receiptNumber,
    supplierName: req.body.supplierName || 'Unknown Supplier',
    warehouseId: req.body.warehouseId || 'wh-main',
    warehouseName: req.body.warehouseName || 'Main Warehouse',
    locationCode: req.body.locationCode || 'Rack A (Bulk Steel & Heavy Goods)',
    receiptDate: req.body.receiptDate || new Date().toISOString().split('T')[0],
    status: req.body.status || 'draft',
    notes: req.body.notes || '',
    createdBy: req.body.createdBy || 'Prince (Inventory Staff)',
    items: req.body.items || [],
    createdAt: new Date().toISOString()
  };
  receipts.unshift(newReceipt);
  res.status(201).json({ success: true, message: 'Receipt created', data: newReceipt });
});

// PUT /api/receipts/:id/validate
router.put('/:id/validate', (req, res) => {
  const index = receipts.findIndex(r => r.id === req.params.id || r.receiptNumber === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Receipt not found' });
  
  if (receipts[index].status === 'done') {
    return res.status(400).json({ success: false, message: 'Receipt is already validated' });
  }

  receipts[index].status = 'done';
  receipts[index].validatedAt = new Date().toISOString();
  receipts[index].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Receipt validated and stock updated in ledger',
    data: receipts[index]
  });
});

// PUT /api/receipts/:id/cancel
router.put('/:id/cancel', (req, res) => {
  const index = receipts.findIndex(r => r.id === req.params.id || r.receiptNumber === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Receipt not found' });
  
  if (receipts[index].status === 'done') {
    return res.status(400).json({ success: false, message: 'Cannot cancel a completed receipt' });
  }

  receipts[index].status = 'cancelled';
  receipts[index].updatedAt = new Date().toISOString();
  res.json({ success: true, message: 'Receipt cancelled', data: receipts[index] });
});

module.exports = router;
