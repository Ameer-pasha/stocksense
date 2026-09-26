import React from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

export default function ProductFilters({
  filters,
  categories = [],
  warehouses = [],
  onChange,
  onReset
}) {
  const hasActiveFilters = Boolean(
    filters.search || 
    filters.category_id || 
    filters.warehouse_id || 
    (filters.is_active !== undefined && filters.is_active !== '')
  );

  return (
    <div className="bg-neutral-900/70 p-4 rounded-xl border border-neutral-800 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search by Name or SKU */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products / SKU..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.category_id || ''}
            onChange={(e) => onChange({ category_id: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {!cat.is_active ? '(Inactive)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse Filter */}
        <div>
          <select
            value={filters.warehouse_id || ''}
            onChange={(e) => onChange({ warehouse_id: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <select
            value={filters.is_active !== undefined ? String(filters.is_active) : ''}
            onChange={(e) => onChange({ is_active: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              title="Reset all filters"
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
