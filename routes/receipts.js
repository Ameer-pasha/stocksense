const express = require('express');
const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const { adjustStock } = require('../services/stockService');
const { nextNumber } = require('../services/counterService');
const { activeWarehouse, activeProduct, validItems, optionalNotes } = require('../services/operationUtils');
const { protect, authorize } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { objectId, requiredString, positiveQueryInt } = require('../utils/validation');

const router = express.Router();
router.use(protect);
const canWrite = authorize('admin', 'manager');
const populate = (id) => Receipt.findById(id).populate('warehouse_id', 'name location')
  .populate('items.product_id', 'name sku unit_of_measure');

router.post('/', canWrite, asyncRoute(async (req, res) => {
  const supplier_name = requiredString(req.body.supplier_name, 'supplier_name');
  const warehouse_id = objectId(req.body.warehouse_id, 'warehouse_id');
  const items = await validItems(req.body.items, 'quantity_received');
  const receipt = await mongoose.connection.transaction(async (session) => {
    await activeWarehouse(warehouse_id, session);
    const doc = new Receipt({
      receipt_number: await nextNumber('receipt', 'REC', session), supplier_name,
      warehouse_id, items, notes: optionalNotes(req.body.notes), created_by: req.user._id
    });
    await doc.save({ session });
    return doc;
  });
  res.status(201).json({ success: true, message: 'Receipt created successfully', data: await populate(receipt._id) });
}));

router.get('/', asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.status !== undefined) {
    if (!['draft', 'done', 'cancelled'].includes(req.query.status)) throw new AppError(400, 'Invalid receipt status');
    filter.status = req.query.status;
  }
  const page = positiveQueryInt(req.query.page, 1, 1000000);
  const limit = positiveQueryInt(req.query.limit, 50);
  const [total, receipts] = await Promise.all([
    Receipt.countDocuments(filter), Receipt.find(filter).populate('warehouse_id', 'name')
      .populate('items.product_id', 'name sku').sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit).limit(limit)
  ]);
  res.json({ success: true, data: receipts, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const receipt = await populate(objectId(req.params.id));
  if (!receipt) throw new AppError(404, 'Receipt not found');
  res.json({ success: true, data: receipt });
}));

router.put('/:id/validate', canWrite, asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  await mongoose.connection.transaction(async (session) => {
    const receipt = await Receipt.findById(id).session(session);
    if (!receipt) throw new AppError(404, 'Receipt not found');
    if (receipt.status !== 'draft') throw new AppError(409, `Cannot validate ${receipt.status} receipt`);
    await activeWarehouse(receipt.warehouse_id, session);
    for (const item of receipt.items) {
      await activeProduct(item.product_id, session);
      await adjustStock({ product_id: item.product_id, warehouse_id: receipt.warehouse_id,
        quantity_change: item.quantity_received, transaction_type: 'receipt',
        reference_id: receipt._id, reference_number: receipt.receipt_number,
        performed_by: req.user._id, notes: `Receipt from ${receipt.supplier_name}`, session });
    }
    receipt.status = 'done';
    await receipt.save({ session });
  });
  res.json({ success: true, message: 'Receipt validated; stock added', data: await populate(id) });
}));

router.put('/:id/cancel', canWrite, asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  const receipt = await Receipt.findOneAndUpdate({ _id: id, status: 'draft' },
    { $set: { status: 'cancelled' } }, { new: true });
  if (!receipt) {
    if (!await Receipt.exists({ _id: id })) throw new AppError(404, 'Receipt not found');
    throw new AppError(409, 'Only draft receipts can be cancelled');
  }
  res.json({ success: true, message: 'Receipt cancelled', data: await populate(id) });
}));

module.exports = router;
