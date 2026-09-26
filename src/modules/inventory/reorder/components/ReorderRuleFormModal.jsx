import React, { useState, useEffect } from 'react';
import { X, Sliders, AlertTriangle } from 'lucide-react';

export default function ReorderRuleFormModal({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  locations = [],
  preselectedProduct = null
}) {
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [reorderQty, setReorderQty] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedProduct) {
      setProductId(String(preselectedProduct.id));
    } else if (products.length > 0) {
      setProductId(String(products[0].id));
    } else {
      setProductId('');
    }
    setLocationId('');
    setMinQty('');
    setMaxQty('');
    setReorderQty('');
    setError('');
  }, [preselectedProduct, products, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const min = Number(minQty);
    const max = Number(maxQty);
    const reorder = Number(reorderQty);

    if (!productId) {
      setError('Please select a product.');
      return;
    }
    if (min <= 0) {
      setError('Minimum stock threshold must be greater than zero.');
      return;
    }
    if (max <= min) {
      setError(`Maximum threshold (${max}) must exceed minimum threshold (${min}).`);
      return;
    }
    if (reorder <= 0) {
      setError('Reorder batch quantity must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        product_id: Number(productId),
        location_id: locationId ? Number(locationId) : null,
        min_quantity: min,
        max_quantity: max,
        reorder_quantity: reorder
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Configure Reordering Rule</h3>
              <p className="text-xs text-neutral-400">Threshold Policy Management (Member 2)</p>
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
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Product SKU & Item <span className="text-blue-400">*</span>
            </label>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.sku}]
                </option>
              ))}
            </select>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Storage Bin / Location (Optional)
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="">All Locations (Aggregate Facility-Wide)</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.full_path || loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          {/* Min & Max Quantities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Minimum Stock <span className="text-blue-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 50"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-all"
              />
              <span className="text-[10px] text-neutral-500 block mt-0.5">Triggers replenishment</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Maximum Stock <span className="text-blue-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 200"
                value={maxQty}
                onChange={(e) => setMaxQty(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-all"
              />
              <span className="text-[10px] text-neutral-500 block mt-0.5">Storage ceiling limit</span>
            </div>
          </div>

          {/* Reorder Quantity */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Replenishment Reorder Batch Qty <span className="text-blue-400">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 100"
              value={reorderQty}
              onChange={(e) => setReorderQty(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-lg shadow-amber-600/20 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Reorder Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
