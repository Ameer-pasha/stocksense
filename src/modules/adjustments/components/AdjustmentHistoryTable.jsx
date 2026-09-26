import React from 'react';
import { SlidersHorizontal, Search, Filter, Calendar, MapPin, User, FileText } from 'lucide-react';
import DiscrepancyBadge from './DiscrepancyBadge';

export default function AdjustmentHistoryTable({
  adjustments,
  loading,
  searchQuery,
  onSearchChange,
  filterReason,
  onReasonChange,
  onOpenNewAdjustment
}) {
  const reasonOptions = ['ALL', 'Damaged', 'Theft/Loss', 'Counting Error', 'Found Stock', 'Expired', 'Periodic Audit'];

  return (
    <div className="card-container">
      {/* Search & Actions Toolbar */}
      <div className="toolbar-container">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search adjustments by ID, product, or SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')} 
              className="btn-text-clear"
            >
              Clear
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <button 
            onClick={onOpenNewAdjustment}
            className="btn-primary flex items-center gap-1.5"
          >
            <SlidersHorizontal size={16} />
            <span>New Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* Filter by Reason */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label flex items-center gap-1">
            <Filter size={14} /> Filter Reason:
          </span>
          <select
            className="filter-select"
            value={filterReason}
            onChange={(e) => onReasonChange(e.target.value)}
          >
            {reasonOptions.map(r => (
              <option key={r} value={r}>
                {r === 'ALL' ? 'All Reasons' : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref Number</th>
              <th>Date & Time</th>
              <th>Product / SKU</th>
              <th>Storage Location</th>
              <th className="text-center">Recorded vs Counted</th>
              <th>Discrepancy (Δ)</th>
              <th>Reason Code</th>
              <th>Auditor / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-loader-row">
                  <div className="loader-spinner" />
                  <span>Loading adjustment audit history...</span>
                </td>
              </tr>
            ) : adjustments.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-state">
                  <p className="text-base font-medium">No adjustment records found</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Conduct your first physical count reconciliation using the button above.
                  </p>
                </td>
              </tr>
            ) : (
              adjustments.map((adj) => (
                <tr key={adj.id} className="table-row-hover">
                  {/* Ref ID */}
                  <td>
                    <span className="sku-mono font-bold text-blue-400">{adj.id}</span>
                  </td>

                  {/* Date */}
                  <td>
                    <div className="text-xs text-neutral-300 flex items-center gap-1">
                      <Calendar size={12} className="text-neutral-500" />
                      {new Date(adj.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {new Date(adj.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Product */}
                  <td>
                    <div className="font-semibold text-white">{adj.productName}</div>
                    <div className="sku-tag text-xs">{adj.sku}</div>
                  </td>

                  {/* Location */}
                  <td>
                    <div className="text-xs font-medium text-neutral-200">{adj.warehouseName}</div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <MapPin size={11} /> {adj.locationCode}
                    </div>
                  </td>

                  {/* Recorded vs Counted */}
                  <td className="text-center">
                    <div className="inline-flex items-center gap-1 text-xs">
                      <span className="text-neutral-400 font-mono">{adj.recordedQuantity}</span>
                      <span className="text-neutral-500">→</span>
                      <span className="font-mono font-bold text-white">{adj.countedQuantity}</span>
                      <span className="text-[11px] text-neutral-400">{adj.unit}</span>
                    </div>
                  </td>

                  {/* Discrepancy */}
                  <td>
                    <DiscrepancyBadge delta={adj.discrepancy} unit={adj.unit} />
                  </td>

                  {/* Reason */}
                  <td>
                    <span className="reason-pill">{adj.reason}</span>
                  </td>

                  {/* Auditor / Remarks */}
                  <td>
                    <div className="text-xs text-neutral-300 flex items-center gap-1">
                      <User size={12} className="text-neutral-500" />
                      {adj.auditedBy}
                    </div>
                    {adj.remarks && (
                      <div className="text-[11px] text-neutral-400 truncate max-w-[200px]" title={adj.remarks}>
                        {adj.remarks}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="text-xs text-neutral-400">
          Showing <strong className="text-neutral-200">{adjustments.length}</strong> logged adjustments (Automatically recorded in Stock Ledger)
        </span>
      </div>
    </div>
  );
}
