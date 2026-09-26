const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
  category: { type: String, default: '', trim: true },
  unit_of_measure: { type: String, required: true, trim: true, default: 'units' },
  reorder_level: { type: Number, default: 0, min: 0 },
  unit_price: { type: Number, default: 0, min: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
