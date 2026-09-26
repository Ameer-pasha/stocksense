const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  adjustment_number: { type: String, required: true, unique: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  system_quantity: { type: Number, required: true, min: 0 },
  counted_quantity: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true, trim: true },
  notes: { type: String, default: '' },
  performed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StockAdjustment', adjustmentSchema);
