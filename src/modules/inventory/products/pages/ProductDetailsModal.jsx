import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Layers, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import AvailabilityTable from '../components/AvailabilityTable';

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onFetchAvailability,
  onGoToReorder
}) {
  const [availability, setAvailability] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setIsLoadingAvailability(true);
      onFetchAvailability(product.id)
        .then((data) => setAvailability(data))
        .catch((err) => console.error('Failed to load availability:', err))
        .finally(() => setIsLoadingAvailability(false));
    } else {
      setAvailability(null);
    }
  }, [isOpen, product, onFetchAvailability]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{product.name}</h3>
                <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs font-mono text-cyan-300 border border-neutral-700">
                  {product.sku}
                </span>
              </div>
              <p className="text-xs text-neutral-400">Product Specification & Inventory Availability View</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Category</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{product.category_name}</span>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Unit of Measure</span>
              <span className="text-sm font-semibold text-white mt-0.5 block uppercase font-mono">{product.unit_of_measure}</span>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Status</span>
              <span className="mt-1 block">
                {product.is_active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 size={12} /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                    <XCircle size={12} /> Inactive
                  </span>
                )}
              </span>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Total In-Stock</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block font-mono">
                {(product.total_available_stock || 0).toLocaleString()} {product.unit_of_measure}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="p-3.5 bg-neutral-950/40 rounded-xl border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              <span className="font-semibold text-neutral-400 block mb-1">Catalog Description:</span>
              {product.description}
            </div>
          )}

          {/* Live Availability Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers size={16} className="text-blue-400" />
                <span>Multi-Warehouse Availability Breakdown</span>
              </h4>
              {onGoToReorder && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToReorder(product);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  Configure Reorder Rules
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
            <AvailabilityTable availability={availability} isLoading={isLoadingAvailability} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
