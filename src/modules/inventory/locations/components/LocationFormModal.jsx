import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, Layers } from 'lucide-react';

const LOCATION_TYPES = [
  { value: 'zone', label: 'Zone / Sector (Top Area)' },
  { value: 'rack', label: 'Rack / Aisle' },
  { value: 'shelf', label: 'Shelf Level' },
  { value: 'bin', label: 'Bin / Tote' },
  { value: 'bay', label: 'Bay (Loading / Staging)' }
];

export default function LocationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialLocation = null,
  warehouses = [],
  allLocations = [],
  defaultWarehouseId = null,
  defaultParentId = null
}) {
  const isEditMode = Boolean(initialLocation);

  const [warehouseId, setWarehouseId] = useState('');
  const [parentId, setParentId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('shelf');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setWarehouseId(initialLocation.warehouse_id ? String(initialLocation.warehouse_id) : '');
      setParentId(initialLocation.parent_id ? String(initialLocation.parent_id) : '');
      setName(initialLocation.name || '');
      setCode(initialLocation.code || '');
      setType(initialLocation.type || 'shelf');
    } else {
      setWarehouseId(defaultWarehouseId ? String(defaultWarehouseId) : (warehouses[0]?.id ? String(warehouses[0].id) : ''));
      setParentId(defaultParentId ? String(defaultParentId) : '');
      setName('');
      setCode('');
      setType('shelf');
    }
    setError('');
  }, [initialLocation, isOpen, defaultWarehouseId, defaultParentId, warehouses]);

  if (!isOpen) return null;

  // Filter possible parents to the selected warehouse, excluding self
  const selectedWhNum = Number(warehouseId);
  const parentCandidates = allLocations.filter(
    (l) => l.warehouse_id === selectedWhNum && (!initialLocation || l.id !== initialLocation.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    if (!warehouseId) {
      setError('Please select a warehouse.');
      return;
    }
    if (!cleanName) {
      setError('Location name is required.');
      return;
    }
    if (!cleanCode) {
      setError('Location code is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        warehouse_id: Number(warehouseId),
        parent_id: parentId ? Number(parentId) : null,
        name: cleanName,
        code: cleanCode,
        type
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
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {isEditMode ? 'Edit Location' : 'Create Storage Location'}
              </h3>
              <p className="text-xs text-neutral-400">Bin & Rack Spatial Hierarchy (Member 2)</p>
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

          {/* Warehouse */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Target Warehouse <span className="text-blue-400">*</span>
            </label>
            <select
              required
              disabled={isEditMode || Boolean(defaultWarehouseId)}
              value={warehouseId}
              onChange={(e) => {
                setWarehouseId(e.target.value);
                setParentId('');
              }}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-60"
            >
              <option value="">Select warehouse...</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>

          {/* Parent Location */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Parent Location (Nesting)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
            >
              <option value="">None (Top-Level Zone / Bay)</option>
              {parentCandidates.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.full_path || loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Location Name <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shelf A1, Rack 04, Receiving Area"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-all font-sans"
            />
          </div>

          {/* Code & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Location Code <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditMode}
                placeholder="e.g. RACK-A"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Storage Type <span className="text-blue-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
              >
                {LOCATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
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
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-lg shadow-cyan-600/20 transition-all"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Location' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
