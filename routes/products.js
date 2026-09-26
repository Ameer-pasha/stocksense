const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const InternalTransfer = require('../models/InternalTransfer');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const { adjustStock, getProductStockByWarehouse } = require('../services/stockService');
const { activeWarehouse } = require('../services/operationUtils');
const { protect, authorize } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { objectId, requiredString, integer, nonNegativeNumber, positiveQueryInt } = require('../utils/validation');

const router = express.Router();
router.use(protect);
const canWrite = authorize('admin', 'manager');

router.get('/', asyncRoute(async (req, res) => {
  const page = positiveQueryInt(req.query.page, 1, 1000000);
  const limit = positiveQueryInt(req.query.limit, 50);
  const filter = { is_active: true };
  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort({ name: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean()
  ]);
  res.json({ success: true, data: products, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}));

router.post('/', canWrite, asyncRoute(async (req, res) => {
  const { name, sku, category = '', unit_of_measure = 'units', reorder_level = 0,
    unit_price = 0, warehouse_id, initial_stock } = req.body;
  const input = {
    name: requiredString(name, 'name'), sku: requiredString(sku, 'sku'),
    category: typeof category === 'string' ? category.trim() : requiredString(category, 'category'),
    unit_of_measure: requiredString(unit_of_measure, 'unit_of_measure'),
    reorder_level: integer(reorder_level, 'reorder_level'),
    unit_price: nonNegativeNumber(unit_price, 'unit_price')
  };
  if ((warehouse_id === undefined) !== (initial_stock === undefined)) {
    throw new AppError(400, 'warehouse_id and initial_stock must be provided together');
  }
  if (initial_stock !== undefined) integer(initial_stock, 'initial_stock');

  const product = await mongoose.connection.transaction(async (session) => {
    if (warehouse_id !== undefined) await activeWarehouse(warehouse_id, session);
    const doc = new Product(input);
    await doc.save({ session });
    if (initial_stock > 0) {
      await adjustStock({ product_id: doc._id, warehouse_id,
        quantity_change: initial_stock, transaction_type: 'adjustment',
        reference_id: doc._id, reference_number: `INIT-${doc.sku}`,
        performed_by: req.user._id, notes: 'Opening stock', session });
    } else if (initial_stock === 0) {
      // A tracked zero balance is useful for out-of-stock alerts; no movement to log.
      await Stock.create([{ product_id: doc._id, warehouse_id, quantity: 0 }], { session });
    }
    return doc;
  });
  res.status(201).json({ success: true, message: 'Product created successfully', data: product });
}));

router.get('/:id/stock', asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  if (!await Product.exists({ _id: id })) throw new AppError(404, 'Product not found');
  res.json({ success: true, product_id: id, data: await getProductStockByWarehouse(id) });
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const product = await Product.findById(objectId(req.params.id));
  if (!product) throw new AppError(404, 'Product not found');
  res.json({ success: true, data: product });
}));

router.put('/:id', canWrite, asyncRoute(async (req, res) => {
  const product = await Product.findById(objectId(req.params.id));
  if (!product) throw new AppError(404, 'Product not found');
  for (const field of ['name', 'sku', 'unit_of_measure']) {
    if (field in req.body) product[field] = requiredString(req.body[field], field);
  }
  if ('category' in req.body) {
    if (typeof req.body.category !== 'string') throw new AppError(400, 'category must be a string');
    product.category = req.body.category.trim();
  }
  if ('reorder_level' in req.body) product.reorder_level = integer(req.body.reorder_level, 'reorder_level');
  if ('unit_price' in req.body) product.unit_price = nonNegativeNumber(req.body.unit_price, 'unit_price');
  if (req.body.is_active === true) product.is_active = true;
  if (req.body.is_active === false) throw new AppError(400, 'Use DELETE to archive a product');
  await product.save();
  res.json({ success: true, message: 'Product updated successfully', data: product });
}));

router.delete('/:id', canWrite, asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  const product = await Product.findById(id);
  if (!product) throw new AppError(404, 'Product not found');
  if (await Stock.exists({ product_id: id, quantity: { $gt: 0 } })) {
    throw new AppError(409, 'Cannot archive a product with stock');
  }
  if (await InternalTransfer.exists({ 'items.product_id': id, status: { $in: ['draft', 'in_transit'] } })) {
    throw new AppError(409, 'Cannot archive a product with pending transfers');
  }
  if (await Receipt.exists({ 'items.product_id': id, status: 'draft' }) ||
      await Delivery.exists({ 'items.product_id': id, status: 'draft' })) {
    throw new AppError(409, 'Cannot archive a product with pending receipts or deliveries');
  }
  product.is_active = false;
  await product.save();
  res.json({ success: true, message: 'Product archived successfully' });
}));

module.exports = router;
