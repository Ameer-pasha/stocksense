import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const COMMON_UOMS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'box', label: 'Boxes (box)' },
  { value: 'mtr', label: 'Meters (mtr)' },
  { value: 'ltr', label: 'Liters (ltr)' },
  { value: 'sqm', label: 'Square Meters (sqm)' },
  { value: 'set', label: 'Sets (set)' }
];

export default function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialProduct = null,
  categories = []
}) {
  const isEditMode = Boolean(initialProduct);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    unit_of_measure: 'kg',
    description: ''
  });

  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        sku: initialProduct.sku || '',
        category_id: initialProduct.category_id || '',
        unit_of_measure: initialProduct.unit_of_measure || 'kg',
        description: initialProduct.description || ''
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        unit_of_measure: 'kg',
        description: ''
      });
    }
    setValidationError('');
  }, [initialProduct, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const name = formData.name.trim();
    const sku = formData.sku.trim().toUpperCase();

    if (!name || name.length < 2) {
      setValidationError('Product name must be at least 2 characters.');
      return;
    }
    if (!sku) {
      setValidationError('SKU code is required.');
      return;
    }
    if (!formData.category_id) {
      setValidationError('Please select an active category.');
      return;
    }
    if (!formData.unit_of_measure) {
      setValidationError('Please select a unit of measure.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        name,
        sku
      });
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {isEditMode ? 'Edit Product Specification' : 'Register New Product'}
              </h3>
              <p className="text-xs text-neutral-400">Master Catalog Registry (Member 2)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Product Name <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mild Steel Rod 12mm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
            />
          </div>

          {/* SKU Code & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                SKU / Code <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditMode}
                placeholder="e.g. STL-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:border-blue-500 transition-all ${
                  isEditMode ? 'opacity-60 cursor-not-allowed text-neutral-400' : 'text-cyan-300'
                }`}
              />
              {isEditMode && (
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  Locked to maintain stock ledger audit integrity.
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Unit of Measure <span className="text-blue-400">*</span>
              </label>
              <select
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                {COMMON_UOMS.map((uom) => (
                  <option key={uom.value} value={uom.value}>
                    {uom.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Category <span className="text-blue-400">*</span>
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">Select an active category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.code ? `(${cat.code})` : ''} {!cat.is_active ? '— INACTIVE' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Technical specifications, grade standards, or packaging details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-all resize-none font-sans"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
