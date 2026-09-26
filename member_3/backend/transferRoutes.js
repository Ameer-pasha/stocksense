// Member 3: Internal Transfers Express Router
const express = require('express');
const router = express.Router();

let transfers = [
  {
    id: 'TRF-2026-001',
    transferNumber: 'TRF-2026-001',
    sourceWarehouseId: 'wh-main',
    sourceWarehouseName: 'Main Warehouse',
    sourceLocationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    destWarehouseId: 'wh-main',
    destWarehouseName: 'Main Warehouse',
    destLocationCode: 'Rack B (Production Floor Staging)',
    scheduledDate: '2026-09-26',
    status: 'done',
    notes: 'Material requisition for Frame Assembly. 60 kg transferred.',
    createdBy: 'Ameer (Warehouse Staff)',
    items: [
      {
        productId: 'prod-001',
        sku: 'STL-ROD-01',
        productName: 'Steel Rods (High Tensile 12mm)',
        quantity: 60,
        unit: 'kg'
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// GET /api/transfers
router.get('/', (req, res) => {
  const { status, from_warehouse, to_warehouse } = req.query;
  let result = [...transfers];
  if (status) result = result.filter(t => t.status.toLowerCase() === status.toLowerCase());
  if (from_warehouse) result = result.filter(t => t.sourceWarehouseId === from_warehouse);
  if (to_warehouse) result = result.filter(t => t.destWarehouseId === to_warehouse);
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/transfers/:id
router.get('/:id', (req, res) => {
  const transfer = transfers.find(t => t.id === req.params.id || t.transferNumber === req.params.id);
  if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
  res.json({ success: true, data: transfer });
});

// POST /api/transfers
router.post('/', (req, res) => {
  const nextNum = (transfers.length + 1).toString().padStart(3, '0');
  const transferNumber = `TRF-${new Date().getFullYear()}-${nextNum}`;
  const newTransfer = {
    id: transferNumber,
    transferNumber,
    sourceWarehouseId: req.body.sourceWarehouseId,
    sourceWarehouseName: req.body.sourceWarehouseName,
    sourceLocationCode: req.body.sourceLocationCode,
    destWarehouseId: req.body.destWarehouseId,
    destWarehouseName: req.body.destWarehouseName,
    destLocationCode: req.body.destLocationCode,
    scheduledDate: req.body.scheduledDate || new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: req.body.notes || '',
    createdBy: req.body.createdBy || 'Ameer (Warehouse Staff)',
    items: req.body.items || [],
    createdAt: new Date().toISOString()
  };
  transfers.unshift(newTransfer);
  res.status(201).json({ success: true, message: 'Transfer scheduled', data: newTransfer });
});

// PUT /api/transfers/:id/confirm (Phase 1: Dispatch)
router.put('/:id/confirm', (req, res) => {
  const index = transfers.findIndex(t => t.id === req.params.id || t.transferNumber === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Transfer not found' });

  if (transfers[index].status !== 'draft') {
    return res.status(400).json({ success: false, message: 'Transfer must be in draft status to confirm dispatch' });
  }

  transfers[index].status = 'in_transit';
  transfers[index].dispatchedAt = new Date().toISOString();
  transfers[index].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Transfer dispatched: goods in transit and stock deducted from origin',
    data: transfers[index]
  });
});

// PUT /api/transfers/:id/complete (Phase 2: Arrival)
router.put('/:id/complete', (req, res) => {
  const index = transfers.findIndex(t => t.id === req.params.id || t.transferNumber === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Transfer not found' });

  if (transfers[index].status !== 'in_transit') {
    return res.status(400).json({ success: false, message: 'Transfer must be in_transit to complete arrival' });
  }

  transfers[index].status = 'done';
  transfers[index].arrivedAt = new Date().toISOString();
  transfers[index].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Transfer completed: goods shelved and credited to destination',
    data: transfers[index]
  });
});

// PUT /api/transfers/:id/cancel
router.put('/:id/cancel', (req, res) => {
  const index = transfers.findIndex(t => t.id === req.params.id || t.transferNumber === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Transfer not found' });

  transfers[index].status = 'cancelled';
  transfers[index].updatedAt = new Date().toISOString();
  res.json({ success: true, message: 'Transfer cancelled', data: transfers[index] });
});

module.exports = router;
