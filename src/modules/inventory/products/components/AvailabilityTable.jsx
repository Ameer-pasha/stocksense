import React from 'react';
import { Warehouse, MapPin, Layers, PackageCheck, AlertCircle } from 'lucide-react';

export default function AvailabilityTable({ availability, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">Fetching stock availability from shared inventory data...</p>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="p-6 text-center text-neutral-400 bg-neutral-900/50 rounded-lg border border-neutral-800">
        <AlertCircle size={28} className="mx-auto text-neutral-500 mb-2" />
        <p className="text-sm">No availability data found for this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Availability Header Summary */}
      <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <PackageCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Aggregated Live Availability</div>
            <div className="text-lg font-bold text-white tracking-wide">
              {availability.total_stock.toLocaleString()} <span className="text-sm text-neutral-400 font-normal">{availability.unit}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Read-Only Audit Ledger
          </span>
        </div>
      </div>

      {/* Location Breakdown Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900/90 text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Warehouse</th>
              <th className="py-3 px-4 font-semibold">Location / Bin Code</th>
              <th className="py-3 px-4 font-semibold">Full Hierarchy Path</th>
              <th className="py-3 px-4 font-semibold text-right">Available Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80">
            {availability.locations.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-neutral-500 text-sm">
                  This product has zero recorded stock across all active warehouse locations.
                </td>
              </tr>
            ) : (
              availability.locations.map((loc, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                    <Warehouse size={15} className="text-blue-400 shrink-0" />
                    <span>{loc.warehouse_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300">
                    <code className="text-xs bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700/60 font-mono text-cyan-300">
                      {loc.location_code}
                    </code>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400 text-xs flex items-center gap-1.5">
                    <MapPin size={13} className="text-neutral-500 shrink-0" />
                    <span>{loc.location_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-400 font-mono">
                    {loc.available_quantity} {availability.unit}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-neutral-500 italic">
        * Note: Stock quantities are populated by Member 1 (Stock Ledger) and Member 3 (Operations). Member 2 provides read-only presentation.
      </p>
    </div>
  );
}
