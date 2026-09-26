const express = require('express');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const { protect } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { objectId } = require('../utils/validation');

const router = express.Router();
router.use(protect);

router.get('/products', asyncRoute(async (req, res) => {
  const { q, warehouse_id } = req.query;
  if (typeof q !== 'string' || q.trim().length < 2 || q.length > 80) {
    throw new AppError(400, 'Search query must be 2 to 80 characters');
  }
  const warehouse = warehouse_id === undefined ? null : objectId(warehouse_id, 'warehouse_id');
  // Treat the search term literally, not as a user-supplied regular expression.
  const pattern = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const products = await Product.find({ is_active: true,
    $or: [{ name: { $regex: pattern, $options: 'i' } }, { sku: { $regex: pattern, $options: 'i' } }]
  }).sort({ name: 1 }).limit(20).lean();
  const stocks = await Stock.find({ product_id: { $in: products.map(p => p._id) },
    ...(warehouse ? { warehouse_id: warehouse } : {}) })
    .populate({ path: 'warehouse_id', select: 'name', match: { is_active: true } }).lean();
  const byProduct = new Map();
  for (const stock of stocks) {
    if (!stock.warehouse_id) continue;
    const key = stock.product_id.toString();
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key).push({ warehouse: stock.warehouse_id.name,
      warehouse_id: stock.warehouse_id._id, quantity: stock.quantity });
  }
  const data = products.map(product => {
    const stock_by_warehouse = byProduct.get(product._id.toString()) || [];
    return { id: product._id, name: product.name, sku: product.sku,
      category: product.category, unit_of_measure: product.unit_of_measure,
      total_stock: stock_by_warehouse.reduce((sum, row) => sum + row.quantity, 0),
      stock_by_warehouse };
  });
  res.json({ success: true, query: q.trim(), count: data.length, data });
}));

module.exports = router;
