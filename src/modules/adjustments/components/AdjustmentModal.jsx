import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, AlertCircle, Building2, Layers, CheckCircle2 } from 'lucide-react';
import DiscrepancyBadge from './DiscrepancyBadge';

const REASONS = [
  { value: 'Damaged', label: 'Damaged / Broken in handling' },
  { value: 'Theft/Loss', label: 'Theft / Unaccounted Loss' },
  { value: 'Counting Error', label: 'Previous Counting / Register Mismatch' },
  { value: 'Found Stock', label: 'Found Stock / Misplaced Inventory' },
  { value: 'Expired', label: 'Expired / Quality Deterioration' },
  { value: 'Periodic Audit', label: 'Routine Physical Stock Count Audit' }
];

export default function AdjustmentModal({
  isOpen,
  onClose,
  products = [],
  initialProduct = null,
  initialLocation = null,
  onSubmit
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedLocationCode, setSelectedLocationCode] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [reason, setReason] = useState(REASONS[0].value);
  const [remarks, setRemarks] = useState('');
  const [auditorName, setAuditorName] = useState('Tarun (Inventory Lead)');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
      const loc = initialLocation || initialProduct.locations?.[0];
      setSelectedLocationCode(loc ? loc.locationCode : '');
      setCountedQty(loc ? loc.quantity : '');
    } else if (products.length > 0) {
      const first = products[0];
      setSelectedProductId(first.id);
      setSelectedLocationCode(first.locations?.[0]?.locationCode || '');
      setCountedQty(first.locations?.[0]?.quantity || 0);
    }
    setErrorMsg('');
  }, [initialProduct, initialLocation, products, isOpen]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || initialProduct;
  const currentLocation = currentProduct?.locations?.find(l => l.locationCode === selectedLocationCode) 
    || currentProduct?.locations?.[0];

  const recordedQty = currentLocation ? currentLocation.quantity : 0;
  const numCounted = countedQty !== '' ? Number(countedQty) : recordedQty;
  const discrepancy = numCounted - recordedQty;

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod && prod.locations?.length > 0) {
      setSelectedLocationCode(prod.locations[0].locationCode);
      setCountedQty(prod.locations[0].quantity);
    } else {
      setSelectedLocationCode('');
      setCountedQty(0);
    }
  };

  const handleLocationSelect = (e) => {
    const locCode = e.target.value;
    setSelectedLocationCode(locCode);
    const loc = currentProduct?.locations?.find(l => l.locationCode === locCode);
    if (loc) {
      setCountedQty(loc.quantity);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentProduct) {
      setErrorMsg('Please select a valid product.');
      return;
    }

    if (!selectedLocationCode) {
      setErrorMsg('Please select a warehouse storage rack/bin.');
      return;
    }

    if (countedQty === '' || isNaN(numCounted) || numCounted < 0) {
      setErrorMsg('Please enter a valid physical count (0 or higher).');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        productId: currentProduct.id,
        productName: currentProduct.name,
        sku: currentProduct.sku,
        warehouseId: currentLocation?.warehouseId || 'wh-main',
        warehouseName: currentLocation?.warehouseName || 'Main Warehouse',
        locationCode: selectedLocationCode,
        recordedQuantity: recordedQty,
        countedQuantity: numCounted,
        unit: currentProduct.unitOfMeasure,
        reason: reason,
        remarks: remarks,
        auditedBy: auditorName
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="icon-badge warning">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="modal-title">Inventory Stock Adjustment</h2>
              <p className="modal-subtitle">
                Reconcile physical stock count against system records and log to Ledger.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="error-callout">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid-2">
            {/* Product Selection */}
            <div className="form-group col-span-2">
              <label className="form-label required">Select Product to Audit</label>
              <select
                className="input-select font-medium"
                value={selectedProductId}
                onChange={handleProductSelect}
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name} — Current total: {p.totalStock} {p.unitOfMeasure}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Location Selection */}
            <div className="form-group col-span-2">
              <label className="form-label required">Specific Warehouse / Rack Location</label>
              <select
                className="input-select"
                value={selectedLocationCode}
                onChange={handleLocationSelect}
                required
              >
                {currentProduct?.locations?.map((loc, idx) => (
                  <option key={idx} value={loc.locationCode}>
                    {loc.warehouseName} → {loc.locationCode} (Current: {loc.quantity} {currentProduct.unitOfMeasure})
                  </option>
                ))}
              </select>
            </div>

            {/* Reconciliation Comparison Panel */}
            <div className="col-span-2 reconciliation-panel">
              <div className="rec-box recorded">
                <span className="rec-label">System Recorded</span>
                <div className="rec-value">
                  {recordedQty} <span className="rec-unit">{currentProduct?.unitOfMeasure}</span>
                </div>
                <span className="text-xs text-neutral-400">Current in database</span>
              </div>

              <div className="rec-divider">
                <span>VS</span>
              </div>

              <div className="rec-box physical">
                <span className="rec-label">Physical Counted</span>
                <div className="flex items-center gap-1.5 justify-center">
                  <input
                    type="number"
                    min="0"
                    className="rec-input"
                    value={countedQty}
                    onChange={(e) => setCountedQty(e.target.value)}
                    required
                    autoFocus
                  />
                  <span className="rec-unit">{currentProduct?.unitOfMeasure}</span>
                </div>
                <span className="text-xs text-neutral-400">Actual stock on shelf</span>
              </div>

              <div className="rec-box delta">
                <span className="rec-label">Discrepancy (Δ)</span>
                <div className="my-1">
                  <DiscrepancyBadge delta={discrepancy} unit={currentProduct?.unitOfMeasure} />
                </div>
                <span className="text-xs text-neutral-400">
                  {discrepancy === 0 
                    ? 'Exact match' 
                    : discrepancy > 0 
                    ? 'Inventory surplus (+)' 
                    : 'Inventory deficit / loss (-)'}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label required">Adjustment Reason</label>
              <select
                className="input-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                {REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Auditor */}
            <div className="form-group">
              <label className="form-label required">Audited By (Staff Member)</label>
              <input
                type="text"
                className="input-text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                required
              />
            </div>

            {/* Remarks / Justification */}
            <div className="form-group col-span-2">
              <label className="form-label">Audit Notes & Justification</label>
              <textarea
                className="input-textarea"
                rows="2"
                placeholder="e.g. 3 kg steel rods damaged in transit, verified and written off..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Applying Adjustment...' : 'Validate & Log to Stock Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
