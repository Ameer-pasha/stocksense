const express = require('express');
const Stock = require('../models/Stock');
const { protect } = require('../middleware/auth');
const { asyncRoute } = require('../utils/errors');
const { objectId } = require('../utils/validation');

const router = express.Router();
router.use(protect);

router.get('/low-stock', asyncRoute(async (req, res) => {
  const match = req.query.warehouse_id === undefined ? {} :
    { warehouse_id: objectId(req.query.warehouse_id, 'warehouse_id') };
  const items = await Stock.aggregate([
    { $match: match },
    { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' }, { $match: { 'product.is_active': true } },
    { $lookup: { from: 'warehouses', localField: 'warehouse_id', foreignField: '_id', as: 'warehouse' } },
    { $unwind: '$warehouse' }, { $match: { 'warehouse.is_active': true } },
    { $match: { $expr: { $lt: ['$quantity', '$product.reorder_level'] } } },
    { $project: {
      product_id: '$product._id', product_name: '$product.name', sku: '$product.sku',
      current_stock: '$quantity', reorder_level: '$product.reorder_level',
      warehouse_name: '$warehouse.name', warehouse_id: '$warehouse._id',
      shortage: { $subtract: ['$product.reorder_level', '$quantity'] },
      status: { $cond: [{ $eq: ['$quantity', 0] }, 'out_of_stock', 'low_stock'] }
    } },
    { $sort: { shortage: -1 } }
  ]);
  res.json({ success: true, count: items.length, data: items });
}));

router.get('/out-of-stock', asyncRoute(async (req, res) => {
  const filter = { quantity: 0 };
  if (req.query.warehouse_id !== undefined) filter.warehouse_id = objectId(req.query.warehouse_id, 'warehouse_id');
  const stocks = await Stock.find(filter)
    .populate({ path: 'product_id', select: 'name sku category', match: { is_active: true } })
    .populate({ path: 'warehouse_id', select: 'name', match: { is_active: true } });
  const items = stocks.filter(stock => stock.product_id && stock.warehouse_id).map(stock => ({
    product_id: stock.product_id._id, product_name: stock.product_id.name,
    sku: stock.product_id.sku, category: stock.product_id.category,
    warehouse: stock.warehouse_id.name, warehouse_id: stock.warehouse_id._id
  }));
  res.json({ success: true, count: items.length, data: items });
}));

module.exports = router;
