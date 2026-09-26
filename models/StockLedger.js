const mongoose = require('mongoose');

const TRANSACTION_TYPES = [
  'receipt', 'delivery', 'transfer_out', 'transfer_in', 'adjustment', 'transfer_cancelled'
];

const stockLedgerSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  transaction_type: { type: String, enum: TRANSACTION_TYPES, required: true },
  reference_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  reference_number: { type: String, required: true, trim: true },
  quantity_change: { type: Number, required: true },
  stock_before: { type: Number, required: true, min: 0 },
  stock_after: { type: Number, required: true, min: 0 },
  performed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

stockLedgerSchema.index({ product_id: 1, createdAt: -1 });
stockLedgerSchema.index({ warehouse_id: 1, createdAt: -1 });
stockLedgerSchema.index({ transaction_type: 1 });
// A document can move each product in a warehouse only once per operation type.
stockLedgerSchema.index(
  { reference_id: 1, transaction_type: 1, product_id: 1, warehouse_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
module.exports.TRANSACTION_TYPES = TRANSACTION_TYPES;
