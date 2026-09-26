const express = require('express');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const InternalTransfer = require('../models/InternalTransfer');
const { protect } = require('../middleware/auth');
const { asyncRoute } = require('../utils/errors');
const { positiveQueryInt } = require('../utils/validation');

const router = express.Router();
router.use(protect);

router.get('/kpis', asyncRoute(async (req, res) => {
  const [total_products, low, pending_receipts, pending_deliveries, internal_transfers_scheduled] = await Promise.all([
    Product.countDocuments({ is_active: true }),
    Stock.aggregate([
      { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' }, { $match: { 'product.is_active': true } },
      { $lookup: { from: 'warehouses', localField: 'warehouse_id', foreignField: '_id', as: 'warehouse' } },
      { $unwind: '$warehouse' }, { $match: { 'warehouse.is_active': true } },
      { $group: { _id: null,
        low_stock_items: { $sum: { $cond: [{ $lt: ['$quantity', '$product.reorder_level'] }, 1, 0] } },
        out_of_stock_items: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } }
      } }
    ]),
    Receipt.countDocuments({ status: 'draft' }),
    Delivery.countDocuments({ status: 'draft' }),
    InternalTransfer.countDocuments({ status: { $in: ['draft', 'in_transit'] } })
  ]);
  res.json({ success: true, data: { total_products,
    low_stock_items: low[0]?.low_stock_items || 0,
    out_of_stock_items: low[0]?.out_of_stock_items || 0,
    pending_receipts, pending_deliveries, internal_transfers_scheduled } });
}));

router.get('/recent-operations', asyncRoute(async (req, res) => {
  const limit = positiveQueryInt(req.query.limit, 20);
  const operations = await StockLedger.find().populate('product_id', 'name sku')
    .populate('warehouse_id', 'name').populate('performed_by', 'name')
    .sort({ createdAt: -1, _id: -1 }).limit(limit);
  res.json({ success: true, data: operations.map(op => ({
    id: op._id, date: op.createdAt, operation_type: op.transaction_type,
    product_name: op.product_id?.name || 'Unknown', sku: op.product_id?.sku || 'N/A',
    warehouse: op.warehouse_id?.name || 'Unknown', quantity_change: op.quantity_change,
    reference: op.reference_number, performed_by: op.performed_by?.name || 'System'
  })) });
}));

module.exports = router;
