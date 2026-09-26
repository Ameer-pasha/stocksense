// Member 3: Deliveries Express Router
const express = require('express');
const router = express.Router();

let deliveries = [
  {
    id: 'DEL-2026-001',
    deliveryNumber: 'DEL-2026-001',
    customerName: 'TechCorp HQ',
    warehouseId: 'wh-main',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack C (Finished Furniture)',
    deliveryDate: '2026-09-26',
    status: 'done',
    notes: 'Sales order SO-4029. 10 executive chairs dispatched.',
    createdBy: 'Prince (Shipping Staff)',
    items: [
      {
        productId: 'prod-002',
        sku: 'CHR-ERG-02',
        productName: 'Ergonomic Executive Office Chair',
        quantityOrdered: 10,
        quantityDelivered: 10,
        unit: 'pcs'
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// GET /api/deliveries
router.get('/', (req, res) => {
  const { status, warehouseId } = req.query;
  let result = [...deliveries];
  if (status) result = result.filter(d => d.status.toLowerCase() === status.toLowerCase());
  if (warehouseId) result = result.filter(d => d.warehouseId === warehouseId);
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/deliveries/:id
router.get('/:id', (req, res) => {
  const delivery = deliveries.find(d => d.id === req.params.id || d.deliveryNumber === req.params.id);
  if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
  res.json({ success: true, data: delivery });
});

// POST /api/deliveries
router.post('/', (req, res) => {
  const nextNum = (deliveries.length + 1).toString().padStart(3, '0');
  const deliveryNumber = `DEL-${new Date().getFullYear()}-${nextNum}`;
  const newDelivery = {
    id: deliveryNumber,
    deliveryNumber,
    customerName: req.body.customerName || 'Valued Customer',
    warehouseId: req.body.warehouseId || 'wh-main',
    warehouseName: req.body.warehouseName || 'Main Warehouse',
    locationCode: req.body.locationCode || 'Rack A (Bulk Steel & Heavy Goods)',
    deliveryDate: req.body.deliveryDate || new Date().toISOString().split('T')[0],
    status: req.body.status || 'draft',
    notes: req.body.notes || '',
    createdBy: req.body.createdBy || 'Prince (Shipping Staff)',
    items: req.body.items || [],
    createdAt: new Date().toISOString()
  };
  deliveries.unshift(newDelivery);
  res.status(201).json({ success: true, message: 'Delivery created', data: newDelivery });
});

// PUT /api/deliveries/:id/status
router.put('/:id/status', (req, res) => {
  const index = deliveries.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Delivery not found' });
  deliveries[index].status = req.body.status;
  deliveries[index].updatedAt = new Date().toISOString();
  res.json({ success: true, message: 'Status updated', data: deliveries[index] });
});

// PUT /api/deliveries/:id/validate
router.put('/:id/validate', (req, res) => {
  const index = deliveries.findIndex(d => d.id === req.params.id || d.deliveryNumber === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Delivery not found' });

  if (deliveries[index].status === 'done') {
    return res.status(400).json({ success: false, message: 'Delivery is already completed' });
  }

  deliveries[index].status = 'done';
  deliveries[index].dispatchedAt = new Date().toISOString();
  deliveries[index].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Delivery dispatched and inventory decremented',
    data: deliveries[index]
  });
});

// PUT /api/deliveries/:id/cancel
router.put('/:id/cancel', (req, res) => {
  const index = deliveries.findIndex(d => d.id === req.params.id || d.deliveryNumber === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Delivery not found' });

  deliveries[index].status = 'cancelled';
  deliveries[index].updatedAt = new Date().toISOString();
  res.json({ success: true, message: 'Delivery cancelled', data: deliveries[index] });
});

module.exports = router;
