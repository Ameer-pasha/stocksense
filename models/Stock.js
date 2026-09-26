const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: {
    type: Number, required: true, default: 0, min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Stock quantity must be a safe integer' }
  }
}, { timestamps: true });

stockSchema.index({ product_id: 1, warehouse_id: 1 }, { unique: true });
stockSchema.index({ warehouse_id: 1 });
module.exports = mongoose.model('Stock', stockSchema);
