const express = require('express');
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');
const { adjustStock } = require('../services/stockService');
const { nextNumber } = require('../services/counterService');
const { activeWarehouse, activeProduct, validItems, optionalNotes } = require('../services/operationUtils');
const { protect, authorize } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { objectId, requiredString, positiveQueryInt } = require('../utils/validation');

const router = express.Router();
router.use(protect);
const canWrite = authorize('admin', 'manager');
const populate = (id) => Delivery.findById(id).populate('warehouse_id', 'name location')
  .populate('items.product_id', 'name sku unit_of_measure');

router.post('/', canWrite, asyncRoute(async (req, res) => {
  const customer_name = requiredString(req.body.customer_name, 'customer_name');
  const warehouse_id = objectId(req.body.warehouse_id, 'warehouse_id');
  const items = await validItems(req.body.items, 'quantity');
  const delivery = await mongoose.connection.transaction(async (session) => {
    await activeWarehouse(warehouse_id, session);
    const doc = new Delivery({
      delivery_number: await nextNumber('delivery', 'DEL', session), customer_name,
      warehouse_id, items, notes: optionalNotes(req.body.notes), created_by: req.user._id
    });
    await doc.save({ session });
    return doc;
  });
  res.status(201).json({ success: true, message: 'Delivery created successfully', data: await populate(delivery._id) });
}));

router.get('/', asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.status !== undefined) {
    if (!['draft', 'done', 'cancelled'].includes(req.query.status)) throw new AppError(400, 'Invalid delivery status');
    filter.status = req.query.status;
  }
  const page = positiveQueryInt(req.query.page, 1, 1000000);
  const limit = positiveQueryInt(req.query.limit, 50);
  const [total, deliveries] = await Promise.all([
    Delivery.countDocuments(filter), Delivery.find(filter).populate('warehouse_id', 'name')
      .populate('items.product_id', 'name sku').sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit).limit(limit)
  ]);
  res.json({ success: true, data: deliveries, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const delivery = await populate(objectId(req.params.id));
  if (!delivery) throw new AppError(404, 'Delivery not found');
  res.json({ success: true, data: delivery });
}));

router.put('/:id/validate', canWrite, asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  await mongoose.connection.transaction(async (session) => {
    const delivery = await Delivery.findById(id).session(session);
    if (!delivery) throw new AppError(404, 'Delivery not found');
    if (delivery.status !== 'draft') throw new AppError(409, `Cannot validate ${delivery.status} delivery`);
    await activeWarehouse(delivery.warehouse_id, session);
    for (const item of delivery.items) {
      await activeProduct(item.product_id, session);
      await adjustStock({ product_id: item.product_id, warehouse_id: delivery.warehouse_id,
        quantity_change: -item.quantity, transaction_type: 'delivery',
        reference_id: delivery._id, reference_number: delivery.delivery_number,
        performed_by: req.user._id, notes: `Delivery to ${delivery.customer_name}`, session });
    }
    delivery.status = 'done';
    await delivery.save({ session });
  });
  res.json({ success: true, message: 'Delivery validated; stock deducted', data: await populate(id) });
}));

router.put('/:id/cancel', canWrite, asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  const delivery = await Delivery.findOneAndUpdate({ _id: id, status: 'draft' },
    { $set: { status: 'cancelled' } }, { new: true });
  if (!delivery) {
    if (!await Delivery.exists({ _id: id })) throw new AppError(404, 'Delivery not found');
    throw new AppError(409, 'Only draft deliveries can be cancelled');
  }
  res.json({ success: true, message: 'Delivery cancelled', data: await populate(id) });
}));

module.exports = router;
