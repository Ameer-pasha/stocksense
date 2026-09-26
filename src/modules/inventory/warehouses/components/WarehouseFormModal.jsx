import React, { useState, useEffect } from 'react';
import { X, Warehouse, AlertTriangle } from 'lucide-react';

export default function WarehouseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialWarehouse = null
}) {
  const isEditMode = Boolean(initialWarehouse);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    capacity_sqft: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialWarehouse) {
      setFormData({
        name: initialWarehouse.name || '',
        code: initialWarehouse.code || '',
        address: initialWarehouse.address || '',
        city: initialWarehouse.city || '',
        state: initialWarehouse.state || '',
        pincode: initialWarehouse.pincode || '',
        capacity_sqft: initialWarehouse.capacity_sqft || ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        capacity_sqft: ''
      });
    }
    setError('');
  }, [initialWarehouse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = formData.name.trim();
    const code = formData.code.trim().toUpperCase();

    if (!name || name.length < 2) {
      setError('Warehouse name is required.');
      return;
    }
    if (!code) {
      setError('Warehouse code is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        name,
        code,
        capacity_sqft: formData.capacity_sqft ? Number(formData.capacity_sqft) : 0
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
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Warehouse size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {isEditMode ? 'Edit Warehouse Facility' : 'Register New Warehouse'}
              </h3>
              <p className="text-xs text-neutral-400">Facility Master Setup (Member 2)</p>
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

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Warehouse Name <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bangalore Central DC"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Facility Code <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditMode}
                placeholder="e.g. WH-BLR-01"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:border-indigo-500 transition-all ${
                  isEditMode ? 'opacity-60 cursor-not-allowed text-neutral-400' : 'text-cyan-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Capacity (Sq. Ft.)
              </label>
              <input
                type="number"
                placeholder="e.g. 45000"
                value={formData.capacity_sqft}
                onChange={(e) => setFormData({ ...formData, capacity_sqft: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Street Address
            </label>
            <input
              type="text"
              placeholder="Plot or building details..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">City</label>
              <input
                type="text"
                placeholder="Bangalore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">State</label>
              <input
                type="text"
                placeholder="Karnataka"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Pincode</label>
              <input
                type="text"
                placeholder="560100"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
