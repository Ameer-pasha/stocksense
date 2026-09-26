import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useProducts } from '../products/hooks/useProducts';
import { stockLedgerService } from '../shared/services/stockLedgerService';

export default function DashboardSummary({ onNavigate }) {
  const { stats, products } = useProducts();
  const ledgerEntries = stockLedgerService.getLedger();

  return (
    <div className="module-container">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Operational Overview Dashboard</h1>
          <p className="module-subtitle">
            Centralized snapshot of real-time inventory levels, fulfillment pipelines, and audit logs.
          </p>
        </div>
        <div className="team-badge-pill">
          Faizan's Module (Integrated with Tarun's Live Metrics)
        </div>
      </div>

      {/* Main KPIs (Connecting to Tarun's Product stats) */}
      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => onNavigate('products')}>
          <div className="stat-icon-wrapper primary">
            <Package size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total SKUs Tracked</span>
            <div className="stat-value-row">
              <span className="stat-value">{stats.totalProducts}</span>
              <span className="stat-sub">Active Catalog Items</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => onNavigate('products')}>
          <div className="stat-icon-wrapper warning">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Low & Zero Stock Items</span>
            <div className="stat-value-row">
              <span className="stat-value text-amber-400">
                {stats.lowStockCount + stats.outOfStockCount}
              </span>
              <span className="stat-sub">{stats.outOfStockCount} Critical / Out of Stock</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper success">
            <ArrowDownLeft size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Pending Receipts (Inbound)</span>
            <div className="stat-value-row">
              <span className="stat-value">3</span>
              <span className="stat-sub">Awaiting vendor docking</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper danger">
            <ArrowUpRight size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Pending Deliveries (Outbound)</span>
            <div className="stat-value-row">
              <span className="stat-value">2</span>
              <span className="stat-sub">Picking & Packing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Left: Quick Access to Tarun's Module */}
        <div className="card-container">
          <div className="card-header-clean">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Package size={17} className="text-blue-400" />
              Products Needing Urgent Restock
            </h3>
            <button 
              onClick={() => onNavigate('products')} 
              className="btn-link text-xs flex items-center gap-1"
            >
              Open Full Catalog <ArrowRight size={13} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {stats.lowStockList.length === 0 ? (
              <div className="text-center py-6 text-neutral-400 text-sm">
                <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
                All products have healthy inventory levels above safety thresholds!
              </div>
            ) : (
              stats.lowStockList.map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm text-white">{item.name}</div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      <span className="sku-tag">{item.sku}</span>
                      <span>Min: {item.minStockThreshold} {item.unitOfMeasure}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm ${item.totalStock === 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {item.totalStock} {item.unitOfMeasure}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {item.totalStock === 0 ? 'Stockout' : 'Below safety'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Stock Movements & Audits (Ameer's Ledger) */}
        <div className="card-container">
          <div className="card-header-clean">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Layers size={17} className="text-emerald-400" />
              Recent Stock Ledger Transactions
            </h3>
            <button 
              onClick={() => onNavigate('ledger')} 
              className="btn-link text-xs flex items-center gap-1"
            >
              View Full Ledger <ArrowRight size={13} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {ledgerEntries.slice(0, 4).map((entry) => (
              <div key={entry.id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between items-start text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400">{entry.documentRef}</span>
                    <span className="category-pill text-[10px]">{entry.documentType}</span>
                  </div>
                  <div className="font-medium text-white mt-1">{entry.productName}</div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">{entry.sourceLocation} → {entry.destLocation}</div>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-bold text-sm ${entry.quantityChange > 0 ? 'text-emerald-400' : entry.quantityChange < 0 ? 'text-rose-400' : 'text-neutral-300'}`}>
                    {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange} {entry.unit}
                  </span>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
