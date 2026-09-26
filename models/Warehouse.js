const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

warehouseSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
module.exports = mongoose.model('Warehouse', warehouseSchema);
