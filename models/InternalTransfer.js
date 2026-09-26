const mongoose = require('mongoose');

const transferItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  quantity_received: { type: Number, default: null }
}, { _id: false });

const internalTransferSchema = new mongoose.Schema({
  transfer_number: { type: String, required: true, unique: true },
  from_warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  to_warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status: { type: String, enum: ['draft', 'in_transit', 'done', 'cancelled'], default: 'draft' },
  scheduled_date: { type: Date, default: Date.now },
  items: { type: [transferItemSchema], required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

internalTransferSchema.index({ status: 1, scheduled_date: -1 });
module.exports = mongoose.model('InternalTransfer', internalTransferSchema);
