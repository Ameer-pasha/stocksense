const express = require('express');
const StockLedger = require('../models/StockLedger');
const { protect } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { objectId, dateFilter, positiveQueryInt } = require('../utils/validation');

const router = express.Router();
router.use(protect);

function ledgerFilter(query) {
  const filter = { ...dateFilter(query) };
  if (query.product_id !== undefined) filter.product_id = objectId(query.product_id, 'product_id');
  if (query.warehouse_id !== undefined) filter.warehouse_id = objectId(query.warehouse_id, 'warehouse_id');
  if (query.transaction_type !== undefined) {
    if (!StockLedger.TRANSACTION_TYPES.includes(query.transaction_type)) {
      throw new AppError(400, 'Invalid transaction_type');
    }
    filter.transaction_type = query.transaction_type;
  }
  return filter;
}

router.get('/summary', asyncRoute(async (req, res) => {
  const filter = ledgerFilter(req.query);
  const summary = await StockLedger.aggregate([
    { $match: filter },
    { $group: {
      _id: '$transaction_type', count: { $sum: 1 },
      total_quantity_in: { $sum: { $cond: [{ $gt: ['$quantity_change', 0] }, '$quantity_change', 0] } },
      total_quantity_out: { $sum: { $cond: [{ $lt: ['$quantity_change', 0] },
        { $abs: '$quantity_change' }, 0] } }
    } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data: summary });
}));

router.get('/', asyncRoute(async (req, res) => {
  const filter = ledgerFilter(req.query);
  const page = positiveQueryInt(req.query.page, 1, 1000000);
  const limit = positiveQueryInt(req.query.limit, 50);
  const [total, entries] = await Promise.all([
    StockLedger.countDocuments(filter),
    StockLedger.find(filter).populate('product_id', 'name sku unit_of_measure')
      .populate('warehouse_id', 'name location').populate('performed_by', 'name email')
      .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit)
  ]);
  res.json({ success: true, data: entries.map(entry => ({
    id: entry._id, date: entry.createdAt, product_id: entry.product_id?._id || null,
    product_name: entry.product_id?.name || 'Unknown', sku: entry.product_id?.sku || 'N/A',
    warehouse_id: entry.warehouse_id?._id || null, warehouse: entry.warehouse_id?.name || 'Unknown',
    transaction_type: entry.transaction_type, reference: entry.reference_number,
    quantity_change: entry.quantity_change, stock_before: entry.stock_before,
    stock_after: entry.stock_after, performed_by: entry.performed_by?.name || 'System', notes: entry.notes
  })), pagination: { total, page, pages: Math.ceil(total / limit), limit } });
}));

router.get('/product/:product_id', asyncRoute(async (req, res) => {
  const product_id = objectId(req.params.product_id, 'product_id');
  const filter = { product_id };
  if (req.query.warehouse_id !== undefined) filter.warehouse_id = objectId(req.query.warehouse_id, 'warehouse_id');
  const limit = positiveQueryInt(req.query.limit, 20);
  const entries = await StockLedger.find(filter).populate('warehouse_id', 'name')
    .populate('performed_by', 'name').sort({ createdAt: -1, _id: -1 }).limit(limit);
  res.json({ success: true, product_id, data: entries });
}));

router.get('/warehouse/:warehouse_id', asyncRoute(async (req, res) => {
  const warehouse_id = objectId(req.params.warehouse_id, 'warehouse_id');
  const filter = { ...ledgerFilter(req.query), warehouse_id };
  const limit = positiveQueryInt(req.query.limit, 50);
  const entries = await StockLedger.find(filter).populate('product_id', 'name sku')
    .populate('performed_by', 'name').sort({ createdAt: -1, _id: -1 }).limit(limit);
  res.json({ success: true, warehouse_id, data: entries });
}));

module.exports = router;
