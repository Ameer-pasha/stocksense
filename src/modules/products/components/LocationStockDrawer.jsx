import React from 'react';
import { X, MapPin, Building2, Layers, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function LocationStockDrawer({ product, isOpen, onClose, onQuickAdjust }) {
  if (!isOpen || !product) return null;

  const totalStock = product.totalStock || 0;
  const isLow = totalStock <= product.minStockThreshold;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="flex items-center gap-2">
              <span className="sku-tag-large">{product.sku}</span>
              <span className="category-badge">{product.category}</span>
            </div>
            <h2 className="drawer-title">{product.name}</h2>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close Drawer">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Summary Box */}
          <div className="drawer-summary-card">
            <div className="summary-item">
              <span className="summary-label">Aggregated Stock</span>
              <span className={`summary-value ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                {totalStock} <span className="text-sm font-normal">{product.unitOfMeasure}</span>
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Min Threshold (Safety)</span>
              <span className="summary-value">
                {product.minStockThreshold} <span className="text-sm font-normal">{product.unitOfMeasure}</span>
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Status</span>
              <span className={`status-pill ${totalStock === 0 ? 'pill-danger' : isLow ? 'pill-warning' : 'pill-success'}`}>
                {totalStock === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          </div>

          <div className="section-divider">
            <h3 className="section-heading flex items-center gap-2">
              <Building2 size={16} /> Warehouse & Rack Breakdown
            </h3>
            <span className="text-xs text-neutral-400">
              {product.locations?.length || 0} active storage nodes
            </span>
          </div>

          {/* Locations List */}
          <div className="locations-list">
            {(!product.locations || product.locations.length === 0) ? (
              <div className="empty-state-card">
                <AlertCircle size={28} className="text-neutral-500 mb-2" />
                <p>No specific storage bins assigned yet.</p>
              </div>
            ) : (
              product.locations.map((loc, idx) => {
                const percent = totalStock > 0 ? Math.round((loc.quantity / totalStock) * 100) : 0;
                return (
                  <div key={idx} className="location-node-card">
                    <div className="location-node-header">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-400" />
                        <div>
                          <h4 className="font-semibold text-sm">{loc.warehouseName}</h4>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Layers size={12} /> {loc.locationCode}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-white">
                          {loc.quantity} <span className="text-xs text-neutral-400">{product.unitOfMeasure}</span>
                        </div>
                        <span className="text-xs text-neutral-400">{percent}% of inventory</span>
                      </div>
                    </div>

                    {/* Capacity / Distribution Bar */}
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }} 
                      />
                    </div>

                    <div className="location-node-footer">
                      <button 
                        onClick={() => {
                          onClose();
                          onQuickAdjust(product, loc);
                        }}
                        className="btn-link text-xs flex items-center gap-1"
                      >
                        Reconcile Physical Count <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="drawer-footer">
          <button 
            type="button" 
            onClick={() => {
              onClose();
              onQuickAdjust(product);
            }} 
            className="btn-primary w-full"
          >
            Perform Stock Adjustment on this Item
          </button>
        </div>
      </div>
    </div>
  );
}
