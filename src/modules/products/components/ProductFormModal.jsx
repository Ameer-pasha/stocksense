import React, { useState, useEffect } from 'react';
import { X, Sparkles, Building2, PackagePlus, AlertCircle } from 'lucide-react';
import { CATEGORIES, UNITS_OF_MEASURE, WAREHOUSES } from '../../shared/constants/warehouses';

export default function ProductFormModal({ isOpen, onClose, onSave, editingProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORIES[0],
    unitOfMeasure: 'kg',
    minStockThreshold: 10,
    initialStock: 0,
    initialWarehouseId: WAREHOUSES[0].id,
    initialLocationCode: WAREHOUSES[0].locations[0].code,
    costPrice: '',
    sellingPrice: ''
  });

  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        category: editingProduct.category || CATEGORIES[0],
        unitOfMeasure: editingProduct.unitOfMeasure || 'pcs',
        minStockThreshold: editingProduct.minStockThreshold || 10,
        costPrice: editingProduct.costPrice || '',
        sellingPrice: editingProduct.sellingPrice || ''
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: CATEGORIES[0],
        unitOfMeasure: 'kg',
        minStockThreshold: 10,
        initialStock: 0,
        initialWarehouseId: WAREHOUSES[0].id,
        initialLocationCode: WAREHOUSES[0].locations[0].code,
        costPrice: '',
        sellingPrice: ''
      });
    }
    setValidationError('');
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SKU') : 'PRD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const handleWarehouseChange = (e) => {
    const whId = e.target.value;
    const selectedWh = WAREHOUSES.find(w => w.id === whId) || WAREHOUSES[0];
    setFormData(prev => ({
      ...prev,
      initialWarehouseId: whId,
      initialLocationCode: selectedWh.locations[0]?.code || 'General Bin'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Product Name is required.');
      return;
    }

    if (!formData.sku.trim()) {
      setValidationError('SKU / Product Code is required.');
      return;
    }

    if (Number(formData.minStockThreshold) < 0) {
      setValidationError('Minimum threshold must be 0 or greater.');
      return;
    }

    try {
      setSubmitting(true);
      const selectedWh = WAREHOUSES.find(w => w.id === formData.initialWarehouseId) || WAREHOUSES[0];

      await onSave({
        ...formData,
        initialWarehouseName: selectedWh.name,
        minStockThreshold: Number(formData.minStockThreshold),
        initialStock: Number(formData.initialStock || 0),
        costPrice: Number(formData.costPrice || 0),
        sellingPrice: Number(formData.sellingPrice || 0)
      });
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedWhObj = WAREHOUSES.find(w => w.id === formData.initialWarehouseId) || WAREHOUSES[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="icon-badge primary">
              <PackagePlus size={20} />
            </div>
            <div>
              <h2 className="modal-title">
                {editingProduct ? 'Update Product Details' : 'Add New Inventory Item'}
              </h2>
              <p className="modal-subtitle">
                Configure SKU, category, reorder thresholds, and warehouse placement.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {validationError && (
          <div className="error-callout">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid-2">
            {/* Name */}
            <div className="form-group col-span-2">
              <label className="form-label required">Product Name</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Steel Rods (High Tensile 12mm)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* SKU with Auto-gen */}
            <div className="form-group">
              <div className="flex justify-between items-center mb-1">
                <label className="form-label required">SKU / Item Code</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="btn-link text-xs flex items-center gap-1"
                >
                  <Sparkles size={12} /> Auto-Generate
                </button>
              </div>
              <input
                type="text"
                className="input-text uppercase"
                placeholder="e.g. STL-ROD-01"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label required">Product Category</label>
              <select
                className="input-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Unit of Measure */}
            <div className="form-group">
              <label className="form-label required">Unit of Measure (UoM)</label>
              <select
                className="input-select"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              >
                {UNITS_OF_MEASURE.map(uom => (
                  <option key={uom.code} value={uom.code}>{uom.label}</option>
                ))}
              </select>
            </div>

            {/* Minimum Reorder Threshold */}
            <div className="form-group">
              <label className="form-label required">
                Min Stock Safety Threshold
              </label>
              <input
                type="number"
                min="0"
                className="input-text"
                placeholder="e.g. 20"
                value={formData.minStockThreshold}
                onChange={(e) => setFormData({ ...formData, minStockThreshold: e.target.value })}
                required
              />
              <span className="form-hint">Triggers Low Stock warning when inventory drops to this amount.</span>
            </div>

            {/* If creating new product, prompt for initial location & stock */}
            {!editingProduct && (
              <>
                <div className="form-group">
                  <label className="form-label">Initial Warehouse</label>
                  <select
                    className="input-select"
                    value={formData.initialWarehouseId}
                    onChange={handleWarehouseChange}
                  >
                    {WAREHOUSES.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Storage Rack / Bin</label>
                  <select
                    className="input-select"
                    value={formData.initialLocationCode}
                    onChange={(e) => setFormData({ ...formData, initialLocationCode: e.target.value })}
                  >
                    {selectedWhObj.locations.map(loc => (
                      <option key={loc.id} value={loc.code}>{loc.code}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Initial Stock Quantity</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      className="input-text"
                      placeholder="0"
                      value={formData.initialStock}
                      onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                    />
                    <span className="unit-label">{formData.unitOfMeasure}</span>
                  </div>
                </div>
              </>
            )}

            {/* Pricing (Optional) */}
            <div className="form-group">
              <label className="form-label">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-text"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-text"
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
