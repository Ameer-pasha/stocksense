import React from 'react';
import { Trash2, AlertCircle, CheckCircle2, TrendingUp, Sliders, MapPin, Package } from 'lucide-react';

export default function ReorderRuleList({
  rules = [],
  isLoading = false,
  onDeleteRule
}) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading reordering policies from service layer...</p>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-3">
        <Sliders size={40} className="mx-auto text-neutral-600" />
        <h4 className="text-base font-semibold text-white">No reordering rules configured</h4>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Establish minimum and maximum safety stock rules per product and storage location.
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
              <th className="py-3.5 px-4 font-semibold">SKU / Product</th>
              <th className="py-3.5 px-4 font-semibold">Location Scope</th>
              <th className="py-3.5 px-4 font-semibold text-right">Min Stock</th>
              <th className="py-3.5 px-4 font-semibold text-right">Max Stock</th>
              <th className="py-3.5 px-4 font-semibold text-right">Reorder Qty</th>
              <th className="py-3.5 px-4 font-semibold text-right">Current Stock</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {rules.map((rule) => {
              const isBreached = rule.status === 'breached';
              const isSurplus = rule.status === 'surplus';

              return (
                <tr key={rule.id} className="hover:bg-neutral-800/40 transition-colors">
                  {/* SKU & Product */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-mono text-cyan-300">
                        {rule.sku}
                      </code>
                      <span className="font-semibold text-white">{rule.product_name}</span>
                    </div>
                  </td>

                  {/* Location Scope */}
                  <td className="py-3 px-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-neutral-500 shrink-0" />
                      <span>{rule.location_name || 'All Locations'}</span>
                    </div>
                  </td>

                  {/* Min Qty */}
                  <td className="py-3 px-4 text-right font-mono font-medium text-amber-400">
                    {rule.min_quantity} {rule.unit}
                  </td>

                  {/* Max Qty */}
                  <td className="py-3 px-4 text-right font-mono text-neutral-400">
                    {rule.max_quantity} {rule.unit}
                  </td>

                  {/* Reorder Qty */}
                  <td className="py-3 px-4 text-right font-mono text-cyan-300 font-semibold">
                    +{rule.reorder_quantity} {rule.unit}
                  </td>

                  {/* Current Live Stock */}
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={isBreached ? 'text-rose-400' : isSurplus ? 'text-indigo-400' : 'text-emerald-400'}>
                      {rule.current_stock} {rule.unit}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    {isBreached ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle size={12} /> Below Min
                      </span>
                    ) : isSurplus ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <TrendingUp size={12} /> Overstocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Adequate
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Reordering Rule"
                    >
                      <Trash2 size={15} />
                    </button>
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
