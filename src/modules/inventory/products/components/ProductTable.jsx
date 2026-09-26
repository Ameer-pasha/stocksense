import React from 'react';
import { 
  Edit3, 
  Eye, 
  Power, 
  Package, 
  CheckCircle2, 
  XCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ProductTable({
  products = [],
  isLoading = false,
  onViewAvailability,
  onEdit,
  onToggleStatus
}) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading products from service layer...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-3">
        <Package size={40} className="mx-auto text-neutral-600" />
        <h4 className="text-base font-semibold text-white">No matching products found</h4>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Try adjusting your search criteria or register a new product into the master catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950/80 text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">SKU / Code</th>
              <th className="py-3.5 px-4 font-semibold">Product Name</th>
              <th className="py-3.5 px-4 font-semibold">Category</th>
              <th className="py-3.5 px-4 font-semibold text-center">Unit</th>
              <th className="py-3.5 px-4 font-semibold text-right">Available Stock</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {products.map((product) => {
              const isActive = product.is_active;

              return (
                <tr 
                  key={product.id} 
                  className={`hover:bg-neutral-800/40 transition-colors ${!isActive ? 'opacity-50 bg-neutral-950/20' : ''}`}
                >
                  {/* SKU */}
                  <td className="py-3 px-4 font-mono font-medium">
                    <span className="bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800 text-xs text-cyan-300 font-semibold tracking-wider">
                      {product.sku}
                    </span>
                  </td>

                  {/* Name & Description */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white text-sm hover:text-blue-400 transition-colors cursor-pointer"
                         onClick={() => onViewAvailability(product)}>
                      {product.name}
                    </div>
                    {product.description && (
                      <div className="text-xs text-neutral-400 line-clamp-1 max-w-xs mt-0.5">
                        {product.description}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-neutral-300 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700/60 font-medium">
                      {product.category_name}
                    </span>
                  </td>

                  {/* Unit */}
                  <td className="py-3 px-4 text-center text-xs text-neutral-400 uppercase font-mono">
                    {product.unit_of_measure}
                  </td>

                  {/* Available Stock */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onViewAvailability(product)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 text-xs font-mono font-medium text-emerald-400 transition-colors group"
                      title="View stock across warehouses & locations"
                    >
                      <span>{(product.total_available_stock || 0).toLocaleString()} {product.unit_of_measure}</span>
                      <ArrowRight size={12} className="text-neutral-500 group-hover:text-white transition-colors" />
                    </button>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle size={12} />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewAvailability(product)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Inspect Stock Availability Breakdown"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit Product Details"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(product)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive 
                            ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10' 
                            : 'text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={isActive ? 'Deactivate Product' : 'Activate Product'}
                      >
                        <Power size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
