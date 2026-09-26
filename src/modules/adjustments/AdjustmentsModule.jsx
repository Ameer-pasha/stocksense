import React, { useState } from 'react';
import { useAdjustments } from './hooks/useAdjustments';
import { useProducts } from '../products/hooks/useProducts';
import AdjustmentHistoryTable from './components/AdjustmentHistoryTable';
import AdjustmentModal from './components/AdjustmentModal';

export default function AdjustmentsModule({ onNotify }) {
  const {
    adjustments,
    filteredAdjustments,
    loading,
    error,
    filterReason,
    setFilterReason,
    searchQuery,
    setSearchQuery,
    submitAdjustment,
    refreshAdjustments
  } = useAdjustments();

  const { products } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (adjustmentData) => {
    try {
      await submitAdjustment(adjustmentData);
      onNotify?.({
        type: 'success',
        message: `Adjustment ${adjustmentData.sku} recorded: ${adjustmentData.discrepancy >= 0 ? '+' : ''}${adjustmentData.discrepancy} ${adjustmentData.unit} applied to stock and logged to Stock Ledger!`
      });
    } catch (err) {
      onNotify?.({ type: 'error', message: err.message || 'Failed to submit adjustment' });
    }
  };

  return (
    <div className="module-container">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Inventory Stock Adjustments</h1>
          <p className="module-subtitle">
            Reconcile recorded inventory with physical warehouse counts, resolve discrepancies, and automatically log audits to the Stock Ledger.
          </p>
        </div>
      </div>

      {/* Adjustments Audit Table */}
      <AdjustmentHistoryTable
        adjustments={filteredAdjustments}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterReason={filterReason}
        onReasonChange={setFilterReason}
        onOpenNewAdjustment={() => setIsModalOpen(true)}
      />

      {/* Stock Adjustment Modal */}
      <AdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
