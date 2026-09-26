const express = require('express');
const mongoose = require('mongoose');
const InternalTransfer = require('../models/InternalTransfer');
const { adjustStock, getCurrentStock } = require('../services/stockService');
const { nextNumber } = require('../services/counterService');
const { activeWarehouse, validItems, optionalNotes } = require('../services/operationUtils');
const { protect, authorize } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { objectId, positiveQueryInt, dateFilter } = require('../utils/validation');

const router = express.Router();
router.use(protect);
const canWrite = authorize('admin', 'manager');
const statuses = ['draft', 'in_transit', 'done', 'cancelled'];
const populate = (id) => InternalTransfer.findById(id)
  .populate('from_warehouse_id', 'name location')
  .populate('to_warehouse_id', 'name location')
  .populate('items.product_id', 'name sku unit_of_measure')
  .populate('created_by', 'name email');

router.post('/', canWrite, asyncRoute(async (req, res) => {
  const { from_warehouse_id, to_warehouse_id, items, scheduled_date, notes } = req.body;
  const fromId = objectId(from_warehouse_id, 'from_warehouse_id');
  const toId = objectId(to_warehouse_id, 'to_warehouse_id');
  if (fromId.equals(toId)) throw new AppError(400, 'Source and destination warehouses must differ');
  const scheduled = scheduled_date === undefined ? new Date() : new Date(scheduled_date);
  if (scheduled_date !== undefined &&
      (typeof scheduled_date !== 'string' || !Number.isFinite(scheduled.getTime()))) {
    throw new AppError(400, 'scheduled_date must be an ISO date');
  }
  const parsedItems = await validItems(items, 'quantity');
  const transfer = await mongoose.connection.transaction(async (session) => {
    await activeWarehouse(fromId, session);
    await activeWarehouse(toId, session);
    // Creation checks availability but does not reserve stock. Confirm rechecks.
    for (const item of parsedItems) {
      const available = await getCurrentStock(item.product_id, fromId, session);
      if (available < item.quantity) {
        throw new AppError(409, `Insufficient stock for product ${item.product_id}. Available: ${available}`);
      }
    }
    const doc = new InternalTransfer({
      transfer_number: await nextNumber('transfer', 'TRF', session),
      from_warehouse_id: fromId, to_warehouse_id: toId, scheduled_date: scheduled,
      items: parsedItems, notes: optionalNotes(notes), created_by: req.user._id
    });
    await doc.save({ session });
    return doc;
  });
  res.status(201).json({ success: true, message: 'Transfer created successfully',
    data: await populate(transfer._id) });
}));

router.get('/', asyncRoute(async (req, res) => {
  const { status, from_warehouse, to_warehouse } = req.query;
  const filter = { ...dateFilter(req.query, 'start_date', 'end_date', 'scheduled_date') };
  if (status !== undefined) {
    if (!statuses.includes(status)) throw new AppError(400, 'Invalid transfer status');
    filter.status = status;
  }
  if (from_warehouse !== undefined) filter.from_warehouse_id = objectId(from_warehouse, 'from_warehouse');
  if (to_warehouse !== undefined) filter.to_warehouse_id = objectId(to_warehouse, 'to_warehouse');
  const page = positiveQueryInt(req.query.page, 1, 1000000);
  const limit = positiveQueryInt(req.query.limit, 50);
  const [total, transfers] = await Promise.all([
    InternalTransfer.countDocuments(filter),
    InternalTransfer.find(filter).populate('from_warehouse_id', 'name location')
      .populate('to_warehouse_id', 'name location').populate('items.product_id', 'name sku unit_of_measure')
      .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit)
  ]);
  res.json({ success: true, count: transfers.length, data: transfers,
    pagination: { total, page, pages: Math.ceil(total / limit), limit } });
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const transfer = await populate(objectId(req.params.id));
  if (!transfer) throw new AppError(404, 'Transfer not found');
  res.json({ success: true, data: transfer });
}));

async function transition(req, res, action) {
  const id = objectId(req.params.id);
  await mongoose.connection.transaction(async (session) => {
    const transfer = await InternalTransfer.findById(id).session(session);
    if (!transfer) throw new AppError(404, 'Transfer not found');
    if (action === 'confirm') {
      if (transfer.status !== 'draft') throw new AppError(409, `Cannot confirm ${transfer.status} transfer`);
      for (const item of transfer.items) {
        await adjustStock({ product_id: item.product_id, warehouse_id: transfer.from_warehouse_id,
          quantity_change: -item.quantity, transaction_type: 'transfer_out',
          reference_id: transfer._id, reference_number: transfer.transfer_number,
          performed_by: req.user._id, notes: `Transfer to ${transfer.to_warehouse_id}`, session });
      }
      transfer.status = 'in_transit';
    } else if (action === 'complete') {
      if (transfer.status !== 'in_transit') throw new AppError(409, `Cannot complete ${transfer.status} transfer`);
      for (const item of transfer.items) {
        await adjustStock({ product_id: item.product_id, warehouse_id: transfer.to_warehouse_id,
          quantity_change: item.quantity, transaction_type: 'transfer_in',
          reference_id: transfer._id, reference_number: transfer.transfer_number,
          performed_by: req.user._id, notes: `Transfer from ${transfer.from_warehouse_id}`, session });
        item.quantity_received = item.quantity;
      }
      transfer.status = 'done';
    } else {
      if (!['draft', 'in_transit'].includes(transfer.status)) {
        throw new AppError(409, `Cannot cancel ${transfer.status} transfer`);
      }
      if (transfer.status === 'in_transit') {
        for (const item of transfer.items) {
          await adjustStock({ product_id: item.product_id, warehouse_id: transfer.from_warehouse_id,
            quantity_change: item.quantity, transaction_type: 'transfer_cancelled',
            reference_id: transfer._id, reference_number: transfer.transfer_number,
            performed_by: req.user._id, notes: 'Transfer cancelled; stock returned', session });
        }
      }
      transfer.status = 'cancelled';
    }
    await transfer.save({ session });
  });
  res.json({ success: true, message: `Transfer ${action === 'cancel' ? 'cancelled' : action === 'confirm' ? 'confirmed' : 'completed'} successfully`,
    data: await populate(id) });
}

router.put('/:id/confirm', canWrite, asyncRoute((req, res) => transition(req, res, 'confirm')));
router.put('/:id/complete', canWrite, asyncRoute((req, res) => transition(req, res, 'complete')));
router.put('/:id/cancel', canWrite, asyncRoute((req, res) => transition(req, res, 'cancel')));

module.exports = router;
