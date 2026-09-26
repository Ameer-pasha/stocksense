const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const { AppError } = require('../utils/errors');
const { objectId, integer } = require('../utils/validation');

async function activeWarehouse(id, session) {
  const warehouseId = objectId(id, 'warehouse_id');
  const query = Warehouse.findOne({ _id: warehouseId, is_active: true });
  if (session) query.session(session);
  const warehouse = await query;
  if (!warehouse) throw new AppError(404, 'Active warehouse not found');
  return warehouse;
}

async function activeProduct(id, session) {
  const productId = objectId(id, 'product_id');
  const query = Product.findOne({ _id: productId, is_active: true });
  if (session) query.session(session);
  const product = await query;
  if (!product) throw new AppError(404, 'Active product not found');
  return product;
}

async function validItems(items, quantityField, session) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new AppError(400, 'items must contain between 1 and 100 products');
  }
  const parsed = items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new AppError(400, 'Invalid item');
    return { product_id: objectId(item.product_id, 'product_id'),
      [quantityField]: integer(item[quantityField], quantityField, 1) };
  });
  const ids = parsed.map(item => item.product_id.toString());
  if (new Set(ids).size !== ids.length) throw new AppError(400, 'Duplicate products in items; combine their quantities');
  const query = Product.countDocuments({ _id: { $in: parsed.map(i => i.product_id) }, is_active: true });
  if (session) query.session(session);
  if (await query !== parsed.length) throw new AppError(404, 'One or more active products not found');
  return parsed;
}

function optionalNotes(notes) {
  if (notes === undefined) return '';
  if (typeof notes !== 'string') throw new AppError(400, 'notes must be a string');
  return notes.trim();
}

module.exports = { activeWarehouse, activeProduct, validItems, optionalNotes };
