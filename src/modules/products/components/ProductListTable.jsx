import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit3, Trash2, SlidersHorizontal, 
  Copy, Check, Layers, ArrowUpDown, RefreshCw 
} from 'lucide-react';
import { CATEGORIES, WAREHOUSES } from '../../shared/constants/warehouses';

export default function ProductListTable({
  products,
  loading,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onlyLowStock,
  onToggleLowStock,
  selectedLocation,
  onLocationChange,
  sortBy,
  sortOrder,
  onSort,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewLocations,
  onQuickAdjust,
  onRefresh
}) {
  const [copiedSku, setCopiedSku] = useState(null);

  const handleCopySku = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  return (
    <div className="card-container">
      {/* Search and Action Toolbar */}
      <div className="toolbar-container">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by SKU code or product title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')} 
              className="btn-text-clear"
              title="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          {/* Refresh */}
          <button 
            onClick={onRefresh} 
            className="btn-secondary flex items-center gap-1.5"
            title="Reload products"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {/* Add Product Button */}
          <button 
            onClick={onAddProduct} 
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label flex items-center gap-1">
            <Filter size={14} /> Category:
          </span>
          <select 
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Warehouse:</span>
          <select 
            className="filter-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="ALL">All Facilities</option>
            {WAREHOUSES.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group ml-auto">
          <label className={`toggle-filter-chip ${onlyLowStock ? 'active' : ''}`}>
            <input
              type="checkbox"
              className="sr-only"
              checked={onlyLowStock}
              onChange={(e) => onToggleLowStock(e.target.checked)}
            />
            <span className="indicator-dot" />
            <span>Only Low / Out of Stock</span>
          </label>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="cursor-pointer" onClick={() => onSort('sku')}>
                <div className="th-content">
                  <span>SKU / Code</span>
                  <ArrowUpDown size={12} className={sortBy === 'sku' ? 'text-blue-400' : 'opacity-40'} />
                </div>
              </th>
              <th className="cursor-pointer" onClick={() => onSort('name')}>
                <div className="th-content">
                  <span>Product Name</span>
                  <ArrowUpDown size={12} className={sortBy === 'name' ? 'text-blue-400' : 'opacity-40'} />
                </div>
              </th>
              <th>Category</th>
              <th className="cursor-pointer text-right" onClick={() => onSort('stock')}>
                <div className="th-content justify-end">
                  <span>Total Stock</span>
                  <ArrowUpDown size={12} className={sortBy === 'stock' ? 'text-blue-400' : 'opacity-40'} />
                </div>
              </th>
              <th>Min Threshold</th>
              <th>Stock Status</th>
              <th>Locations</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-loader-row">
                  <div className="loader-spinner" />
                  <span>Loading inventory items...</span>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-state">
                  <p className="text-base font-medium">No matching products found</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Try adjusting your search keywords, clear filters, or add a new item.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((item) => {
                const isZero = item.totalStock === 0;
                const isLow = !isZero && item.totalStock <= item.minStockThreshold;

                return (
                  <tr key={item.id} className="table-row-hover">
                    {/* SKU */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="sku-mono">{item.sku}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySku(item.sku)}
                          className="btn-icon-subtle"
                          title="Copy SKU code"
                        >
                          {copiedSku === item.sku ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-neutral-400">
                        {item.costPrice > 0 ? `Cost: ₹${item.costPrice.toFixed(2)}` : 'Internal item'}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="category-pill">{item.category}</span>
                    </td>

                    {/* Total Stock */}
                    <td className="text-right">
                      <span className={`font-mono font-bold text-base ${isZero ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.totalStock}
                      </span>
                      <span className="text-xs text-neutral-400 ml-1">{item.unitOfMeasure}</span>
                    </td>

                    {/* Threshold */}
                    <td>
                      <span className="text-xs font-mono text-neutral-300">
                        {item.minStockThreshold} {item.unitOfMeasure}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td>
                      {isZero ? (
                        <span className="status-pill pill-danger">Out of Stock</span>
                      ) : isLow ? (
                        <span className="status-pill pill-warning">Low Stock</span>
                      ) : (
                        <span className="status-pill pill-success">In Stock</span>
                      )}
                    </td>

                    {/* Location Breakdown Button */}
                    <td>
                      <button
                        onClick={() => onViewLocations(item)}
                        className="btn-locations-pill"
                        title="View warehouse & rack breakdown"
                      >
                        <Layers size={13} />
                        <span>{item.locations?.length || 0} Facilities</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td>
                      <div className="action-buttons-group">
                        <button
                          onClick={() => onQuickAdjust(item)}
                          className="btn-action-icon adjust"
                          title="Stock Adjustment (Count vs System)"
                        >
                          <SlidersHorizontal size={15} />
                        </button>
                        <button
                          onClick={() => onEditProduct(item)}
                          className="btn-action-icon edit"
                          title="Edit Product"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(item)}
                          className="btn-action-icon delete"
                          title="Remove Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="text-xs text-neutral-400">
          Showing <strong className="text-neutral-200">{products.length}</strong> catalog items
        </span>
      </div>
    </div>
  );
}
