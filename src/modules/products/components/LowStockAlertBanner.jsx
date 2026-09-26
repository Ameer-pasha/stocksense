import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ArrowRight, BellRing } from 'lucide-react';

export default function LowStockAlertBanner({ lowStockList, onSelectProduct, onQuickAdjust }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!lowStockList || lowStockList.length === 0) return null;

  return (
    <div className="alert-banner warning">
      <div className="alert-banner-header">
        <div className="alert-banner-title">
          <div className="alert-icon-pulse">
            <BellRing size={18} />
          </div>
          <div>
            <strong>Reorder Alert: {lowStockList.length} item{lowStockList.length > 1 ? 's' : ''} require attention</strong>
            <p className="alert-subtitle">
              Current inventory has reached or fallen below defined minimum reordering safety thresholds.
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-text-action"
        >
          {isExpanded ? (
            <>Hide Items <ChevronUp size={16} /></>
          ) : (
            <>View Details <ChevronDown size={16} /></>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="alert-items-list">
          {lowStockList.map(item => {
            const isZero = item.totalStock === 0;
            return (
              <div key={item.id} className="alert-item-card">
                <div className="alert-item-info">
                  <span className={`status-pill ${isZero ? 'pill-danger' : 'pill-warning'}`}>
                    {isZero ? 'OUT OF STOCK' : 'LOW STOCK'}
                  </span>
                  <span className="font-semibold">{item.name}</span>
                  <span className="sku-tag">{item.sku}</span>
                </div>
                <div className="alert-item-metrics">
                  <div className="metric-box">
                    <span className="metric-lbl">Available:</span>
                    <span className={`metric-val ${isZero ? 'text-rose-400' : 'text-amber-400'}`}>
                      {item.totalStock} {item.unitOfMeasure}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-lbl">Safety Min:</span>
                    <span className="metric-val">{item.minStockThreshold} {item.unitOfMeasure}</span>
                  </div>
                  <button 
                    onClick={() => onQuickAdjust(item)}
                    className="btn-action-small"
                    title="Audit physical count"
                  >
                    Adjust Stock
                  </button>
                  <button 
                    onClick={() => onSelectProduct(item)}
                    className="btn-action-outline-small"
                    title="View warehouse distribution"
                  >
                    Locations <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
