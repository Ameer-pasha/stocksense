const express = require('express');
const Warehouse = require('../models/Warehouse');
const Stock = require('../models/Stock');
const InternalTransfer = require('../models/InternalTransfer');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const { getWarehouseStock } = require('../services/stockService');
const { protect, authorize } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { objectId, requiredString } = require('../utils/validation');

const router = express.Router();
router.use(protect);
const canWrite = authorize('admin', 'manager');

router.get('/', asyncRoute(async (req, res) => {
  const warehouses = await Warehouse.find({ is_active: true }).sort({ name: 1 }).lean();
  const stocks = await Stock.find({ warehouse_id: { $in: warehouses.map(w => w._id) } })
    .populate('product_id', 'unit_price').lean();
  const stats = new Map(warehouses.map(w => [w._id.toString(), { total_products: 0, total_stock_value: 0 }]));
  for (const stock of stocks) {
    const entry = stats.get(stock.warehouse_id.toString());
    if (!entry || !stock.product_id) continue;
    entry.total_products++;
    entry.total_stock_value += stock.quantity * (stock.product_id.unit_price || 0);
  }
  res.json({ success: true, data: warehouses.map(w => ({
    id: w._id, name: w.name, location: w.location, manager_id: w.manager_id,
    ...stats.get(w._id.toString()), created_at: w.createdAt
  })) });
}));

router.post('/', canWrite, asyncRoute(async (req, res) => {
  const { name, location, manager_id } = req.body;
  const data = { name: requiredString(name, 'name'), location: requiredString(location, 'location') };
  if (manager_id !== undefined && manager_id !== null) {
    data.manager_id = objectId(manager_id, 'manager_id');
    if (!await User.exists({ _id: data.manager_id })) throw new AppError(404, 'Manager not found');
  }
  const warehouse = await Warehouse.create(data);
  res.status(201).json({ success: true, message: 'Warehouse created successfully', data: warehouse });
}));

router.get('/:id/stock', asyncRoute(async (req, res) => {
  const warehouse = await Warehouse.findById(objectId(req.params.id));
  if (!warehouse) throw new AppError(404, 'Warehouse not found');
  res.json({ success: true, warehouse_name: warehouse.name,
    data: await getWarehouseStock(warehouse._id) });
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const warehouse = await Warehouse.findById(objectId(req.params.id))
    .populate('manager_id', 'name email');
  if (!warehouse) throw new AppError(404, 'Warehouse not found');
  res.json({ success: true, data: warehouse });
}));

router.put('/:id', canWrite, asyncRoute(async (req, res) => {
  const warehouse = await Warehouse.findById(objectId(req.params.id));
  if (!warehouse) throw new AppError(404, 'Warehouse not found');
  if ('name' in req.body) warehouse.name = requiredString(req.body.name, 'name');
  if ('location' in req.body) warehouse.location = requiredString(req.body.location, 'location');
  if ('manager_id' in req.body) {
    warehouse.manager_id = req.body.manager_id === null ? null : objectId(req.body.manager_id, 'manager_id');
    if (warehouse.manager_id && !await User.exists({ _id: warehouse.manager_id })) {
      throw new AppError(404, 'Manager not found');
    }
  }
  if (req.body.is_active === true) warehouse.is_active = true;
  if (req.body.is_active === false) throw new AppError(400, 'Use DELETE to deactivate a warehouse');
  await warehouse.save();
  res.json({ success: true, message: 'Warehouse updated successfully', data: warehouse });
}));

router.delete('/:id', canWrite, asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  const warehouse = await Warehouse.findById(id);
  if (!warehouse) throw new AppError(404, 'Warehouse not found');
  const stocked = await Stock.countDocuments({ warehouse_id: id, quantity: { $gt: 0 } });
  if (stocked) throw new AppError(409, `Cannot deactivate warehouse: ${stocked} products have stock`);
  const pending = await InternalTransfer.countDocuments({
    status: { $in: ['draft', 'in_transit'] },
    $or: [{ from_warehouse_id: id }, { to_warehouse_id: id }]
  });
  if (pending) throw new AppError(409, 'Cannot deactivate warehouse with pending transfers');
  if (await Receipt.exists({ warehouse_id: id, status: 'draft' }) ||
      await Delivery.exists({ warehouse_id: id, status: 'draft' })) {
    throw new AppError(409, 'Cannot deactivate warehouse with pending receipts or deliveries');
  }
  warehouse.is_active = false;
  await warehouse.save();
  res.json({ success: true, message: 'Warehouse deactivated successfully' });
}));

module.exports = router;
