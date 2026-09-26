const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const { activeProduct, activeWarehouse } = require('./operationUtils');
const { AppError } = require('../utils/errors');
const { objectId, integer, requiredString } = require('../utils/validation');

const SIGNS = {
  receipt: 1, delivery: -1, transfer_out: -1, transfer_in: 1,
  adjustment: 0, transfer_cancelled: 1
};

/**
 * The ONLY way to change stock. Pass the SAME active session used to save the
 * source document. An atomic conditional $inc prevents negative stock; the
 * ledger write and quantity update commit or roll back together.
 */
async function adjustStock({
  product_id, warehouse_id, quantity_change, transaction_type, reference_id,
  reference_number, performed_by, notes = '', session
}) {
  if (!session || !session.inTransaction()) {
    throw new AppError(400, 'adjustStock requires an active MongoDB transaction session');
  }
  const product = objectId(product_id, 'product_id');
  const warehouse = objectId(warehouse_id, 'warehouse_id');
  const reference = objectId(reference_id, 'reference_id');
  integer(quantity_change, 'quantity_change', Number.MIN_SAFE_INTEGER);
  if (!quantity_change) throw new AppError(400, 'quantity_change cannot be zero');
  if (!Object.hasOwn(SIGNS, transaction_type)) throw new AppError(400, 'Invalid transaction_type');
  if (SIGNS[transaction_type] && Math.sign(quantity_change) !== SIGNS[transaction_type]) {
    throw new AppError(400, `quantity_change has the wrong sign for ${transaction_type}`);
  }
  const referenceNumber = requiredString(reference_number, 'reference_number');
  const actor = performed_by ? objectId(performed_by, 'performed_by') : null;
  if (typeof notes !== 'string') throw new AppError(400, 'notes must be a string');
  await activeProduct(product, session);
  await activeWarehouse(warehouse, session);

  let stock;
  if (quantity_change > 0) {
    stock = await Stock.findOneAndUpdate(
      { product_id: product, warehouse_id: warehouse },
      { $inc: { quantity: quantity_change } },
      { new: true, upsert: true, session, setDefaultsOnInsert: false }
    );
  } else {
    stock = await Stock.findOneAndUpdate(
      { product_id: product, warehouse_id: warehouse, quantity: { $gte: -quantity_change } },
      { $inc: { quantity: quantity_change } },
      { new: true, session }
    );
    if (!stock) {
      const available = await getCurrentStock(product, warehouse, session);
      throw new AppError(409, `Insufficient stock. Available: ${available}, Requested: ${-quantity_change}`);
    }
  }

  if (!Number.isSafeInteger(stock.quantity) || stock.quantity < 0) {
    throw new AppError(400, 'Stock quantity exceeds safe integer range');
  }
  const stock_before = stock.quantity - quantity_change;
  const [ledgerEntry] = await StockLedger.create([{
    product_id: product, warehouse_id: warehouse, transaction_type,
    reference_id: reference, reference_number: referenceNumber,
    quantity_change, stock_before, stock_after: stock.quantity,
    performed_by: actor, notes: notes.trim()
  }], { session });
  return { stock, ledgerEntry };
}

async function getCurrentStock(product_id, warehouse_id, session) {
  const query = Stock.findOne({ product_id, warehouse_id });
  if (session) query.session(session);
  const stock = await query.lean();
  return stock ? stock.quantity : 0;
}

async function getProductStockByWarehouse(product_id) {
  const stocks = await Stock.find({ product_id }).populate('warehouse_id', 'name location').lean();
  return stocks.filter(s => s.warehouse_id).map(s => ({
    warehouse_id: s.warehouse_id._id, warehouse_name: s.warehouse_id.name,
    warehouse_location: s.warehouse_id.location, quantity: s.quantity
  }));
}

async function getWarehouseStock(warehouse_id) {
  const stocks = await Stock.find({ warehouse_id })
    .populate('product_id', 'name sku category unit_of_measure unit_price').lean();
  return stocks.filter(s => s.product_id).map(s => ({
    product_id: s.product_id._id, product_name: s.product_id.name,
    sku: s.product_id.sku, category: s.product_id.category,
    unit: s.product_id.unit_of_measure, quantity: s.quantity, last_updated: s.updatedAt
  }));
}

module.exports = { adjustStock, getCurrentStock, getProductStockByWarehouse, getWarehouseStock };
