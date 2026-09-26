const express = require('express');
const mongoose = require('mongoose');
const StockAdjustment = require('../models/StockAdjustment');
const { adjustStock, getCurrentStock } = require('../services/stockService');
const { nextNumber } = require('../services/counterService');
const { activeWarehouse, activeProduct, optionalNotes } = require('../services/operationUtils');
const { protect, authorize } = require('../middleware/auth');
const { asyncRoute } = require('../utils/errors');
const { objectId, integer, requiredString, dateFilter, positiveQueryInt } = require('../utils/validation');

const router = express.Router();
router.use(protect);

router.post('/', authorize('admin', 'manager'), asyncRoute(async (req, res) => {
  const { product_id, warehouse_id, counted_quantity, reason, notes } = req.body;
  const product = objectId(product_id, 'product_id');
  const warehouse = objectId(warehouse_id, 'warehouse_id');
  integer(counted_quantity, 'counted_quantity');
  const explanation = requiredString(reason, 'reason');
  const detail = optionalNotes(notes);
  const result = await mongoose.connection.transaction(async (session) => {
    await activeProduct(product, session);
    await activeWarehouse(warehouse, session);
    const system_quantity = await getCurrentStock(product, warehouse, session);
    const difference = counted_quantity - system_quantity;
    if (!difference) return { product_id: product, warehouse_id: warehouse,
      system_quantity, counted_quantity, difference: 0 };

    const adjustment = new StockAdjustment({
      adjustment_number: await nextNumber('adjustment', 'ADJ', session),
      product_id: product, warehouse_id: warehouse, system_quantity,
      counted_quantity, reason: explanation, notes: detail, performed_by: req.user._id
    });
    await adjustment.save({ session });
    const { ledgerEntry } = await adjustStock({ product_id: product, warehouse_id: warehouse,
      quantity_change: difference, transaction_type: 'adjustment', reference_id: adjustment._id,
      reference_number: adjustment.adjustment_number, performed_by: req.user._id,
      notes: `${explanation}${detail ? `: ${detail}` : ''}`, session });
    return { adjustment_number: adjustment.adjustment_number, product_id: product,
      warehouse_id: warehouse, system_quantity, counted_quantity, difference,
      reason: explanation, notes: detail, ledger_entry: ledgerEntry };
  });
  res.status(result.difference ? 201 : 200).json({ success: true,
    message: result.difference ? 'Stock adjustment completed successfully' : 'No adjustment needed', data: result });
}));

router.get('/', asyncRoute(async (req, res) => {
  const filter = { ...dateFilter(req.query) };
  if (req.query.product_id !== undefined) filter.product_id = objectId(req.query.product_id, 'product_id');
  if (req.query.warehouse_id !== undefined) filter.warehouse_id = objectId(req.query.warehouse_id, 'warehouse_id');
  const page = positiveQueryInt(req.query.page, 1, 1000000);
  const limit = positiveQueryInt(req.query.limit, 50);
  const [total, adjustments] = await Promise.all([
    StockAdjustment.countDocuments(filter),
    StockAdjustment.find(filter).populate('product_id', 'name sku')
      .populate('warehouse_id', 'name').populate('performed_by', 'name')
      .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit)
  ]);
  res.json({ success: true, count: adjustments.length,
    data: adjustments.map(adj => ({
      id: adj._id, date: adj.createdAt, adjustment_number: adj.adjustment_number,
      product_name: adj.product_id?.name || 'Unknown', sku: adj.product_id?.sku || 'N/A',
      warehouse: adj.warehouse_id?.name || 'Unknown', old_stock: adj.system_quantity,
      new_stock: adj.counted_quantity, difference: adj.counted_quantity - adj.system_quantity,
      reason: adj.reason, notes: adj.notes, adjusted_by: adj.performed_by?.name || 'System'
    })), pagination: { total, page, pages: Math.ceil(total / limit), limit } });
}));

module.exports = router;
