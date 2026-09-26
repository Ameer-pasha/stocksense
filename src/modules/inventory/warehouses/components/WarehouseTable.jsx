import React from 'react';
import { 
  Warehouse, 
  MapPin, 
  Layers, 
  Edit3, 
  Power, 
  CheckCircle2, 
  XCircle,
  ArrowRight
} from 'lucide-react';

export default function WarehouseTable({
  warehouses = [],
  isLoading = false,
  onInspect,
  onEdit,
  onToggleStatus,
  onViewLocations
}) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading warehouses from service layer...</p>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-3">
        <Warehouse size={40} className="mx-auto text-neutral-600" />
        <h4 className="text-base font-semibold text-white">No warehouses registered</h4>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Add your primary distribution center or manufacturing plant to begin organizing inventory.
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
              <th className="py-3.5 px-4 font-semibold">Warehouse Code</th>
              <th className="py-3.5 px-4 font-semibold">Facility Name</th>
              <th className="py-3.5 px-4 font-semibold">City / Location</th>
              <th className="py-3.5 px-4 font-semibold text-right">Capacity (sq ft)</th>
              <th className="py-3.5 px-4 font-semibold text-center">Sub-Locations</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {warehouses.map((wh) => {
              const isActive = wh.is_active;

              return (
                <tr 
                  key={wh.id} 
                  className={`hover:bg-neutral-800/40 transition-colors ${!isActive ? 'opacity-50 bg-neutral-950/20' : ''}`}
                >
                  {/* Code */}
                  <td className="py-3 px-4 font-mono font-medium">
                    <span className="bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800 text-xs text-cyan-300 font-semibold tracking-wider">
                      {wh.code}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Warehouse size={16} className="text-indigo-400 shrink-0" />
                      <span>{wh.name}</span>
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-3 px-4 text-neutral-300 text-xs">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <MapPin size={13} className="text-neutral-500 shrink-0" />
                      <span>{wh.city || 'Not specified'}{wh.state ? `, ${wh.state}` : ''}</span>
                    </div>
                  </td>

                  {/* Capacity */}
                  <td className="py-3 px-4 text-right font-mono text-xs text-neutral-300">
                    {wh.capacity_sqft ? wh.capacity_sqft.toLocaleString() : '—'}
                  </td>

                  {/* Locations Count with Link */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onViewLocations(wh.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-blue-400 border border-neutral-700/60 transition-colors"
                      title="Inspect Location Tree Hierarchy"
                    >
                      <Layers size={12} />
                      <span>{wh.location_count || 0} bins/racks</span>
                      <ArrowRight size={10} />
                    </button>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(wh)}
                        className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit Warehouse Facility"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(wh)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive 
                            ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10' 
                            : 'text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={isActive ? 'Deactivate Warehouse' : 'Activate Warehouse'}
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
