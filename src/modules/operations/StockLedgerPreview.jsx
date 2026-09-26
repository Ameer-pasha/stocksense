import React, { useState, useEffect } from 'react';
import { History, Search, ArrowRight, Layers, User } from 'lucide-react';
import { stockLedgerService } from '../shared/services/stockLedgerService';

export default function StockLedgerPreview() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setEntries(stockLedgerService.getLedger());

    const handleUpdate = () => {
      setEntries(stockLedgerService.getLedger());
    };

    window.addEventListener('stocksense:ledger_updated', handleUpdate);
    return () => window.removeEventListener('stocksense:ledger_updated', handleUpdate);
  }, []);

  const filtered = entries.filter(e => {
    const q = query.toLowerCase();
    return !q || 
      e.productName.toLowerCase().includes(q) || 
      e.sku.toLowerCase().includes(q) || 
      e.documentRef.toLowerCase().includes(q) ||
      e.documentType.toLowerCase().includes(q);
  });

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Unified Stock Ledger</h1>
          <p className="module-subtitle">
            Immutable log of all incoming receipts, outgoing delivery dispatches, internal movements, and physical stock count adjustments.
          </p>
        </div>
        <div className="team-badge-pill">
          Ameer's Module (Receiving Tarun's live Adjustment Logs)
        </div>
      </div>

      <div className="card-container">
        <div className="toolbar-container">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search ledger by Ref ID, product name, or movement type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc Ref</th>
                <th>Type</th>
                <th>Timestamp</th>
                <th>Product / SKU</th>
                <th>Movement Path (Source → Destination)</th>
                <th className="text-right">Quantity Delta</th>
                <th>Reason & Performer</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="table-row-hover">
                  <td>
                    <span className="sku-mono font-bold text-blue-400">{entry.documentRef}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      entry.documentType === 'RECEIPT' ? 'pill-success' :
                      entry.documentType === 'DELIVERY' ? 'pill-danger' :
                      entry.documentType === 'ADJUSTMENT' ? 'pill-warning' : 'pill-info'
                    }`}>
                      {entry.documentType}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs text-neutral-300">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-white">{entry.productName}</div>
                    <div className="sku-tag text-xs">{entry.sku}</div>
                  </td>
                  <td>
                    <div className="text-xs text-neutral-300 flex items-center gap-1.5">
                      <span>{entry.sourceLocation}</span>
                      <ArrowRight size={13} className="text-neutral-500" />
                      <span className="text-neutral-200">{entry.destLocation}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span className={`font-mono font-bold text-sm ${
                      entry.quantityChange > 0 ? 'text-emerald-400' :
                      entry.quantityChange < 0 ? 'text-rose-400' : 'text-neutral-400'
                    }`}>
                      {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange} {entry.unit}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs text-neutral-300">{entry.reason}</div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <User size={11} /> {entry.performedBy}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span className="text-xs text-neutral-400">
            Showing <strong className="text-neutral-200">{filtered.length}</strong> ledger records
          </span>
        </div>
      </div>
    </div>
  );
}
