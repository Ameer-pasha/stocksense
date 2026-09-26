const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receipt_number: { type: String, required: true, unique: true },
  supplier_name: { type: String, required: true, trim: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity_received: { type: Number, required: true, min: 1 }
  }],
  status: { type: String, enum: ['draft', 'done', 'cancelled'], default: 'draft' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
