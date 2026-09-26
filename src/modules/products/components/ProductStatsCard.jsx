import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';

export default function ProductStatsCard({ stats, onFilterLowStock, isLowStockActive }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper primary">
          <Package size={22} />
        </div>
        <div className="stat-details">
          <span className="stat-label">Total SKUs in Catalog</span>
          <div className="stat-value-row">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-sub">Active Items</span>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper success">
          <CheckCircle2 size={22} />
        </div>
        <div className="stat-details">
          <span className="stat-label">Optimal Stock</span>
          <div className="stat-value-row">
            <span className="stat-value text-emerald-400">{stats.inStockCount}</span>
            <span className="stat-sub">Healthy levels</span>
          </div>
        </div>
      </div>

      <div 
        className={`stat-card clickable ${isLowStockActive ? 'border-amber-500 ring-2 ring-amber-500/20' : ''}`}
        onClick={onFilterLowStock}
        title="Click to toggle low stock filter"
      >
        <div className="stat-icon-wrapper warning">
          <AlertTriangle size={22} />
        </div>
        <div className="stat-details">
          <div className="flex justify-between items-center">
            <span className="stat-label">Low Stock Warning</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
              Reorder soon
            </span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value text-amber-400">{stats.lowStockCount}</span>
            <span className="stat-sub">Below threshold</span>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper danger">
          <XCircle size={22} />
        </div>
        <div className="stat-details">
          <span className="stat-label">Out of Stock</span>
          <div className="stat-value-row">
            <span className="stat-value text-rose-400">{stats.outOfStockCount}</span>
            <span className="stat-sub">Zero inventory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
