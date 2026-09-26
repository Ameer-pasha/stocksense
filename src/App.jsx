import React, { useState } from 'react';
import Navbar from './modules/shared/components/Navbar';
import Sidebar from './modules/shared/components/Sidebar';
import ProductsModule from './modules/products/ProductsModule';
import AdjustmentsModule from './modules/adjustments/AdjustmentsModule';
import DashboardSummary from './modules/dashboard/DashboardSummary';
import StockLedgerPreview from './modules/operations/StockLedgerPreview';
import ModulePlaceholder from './modules/operations/ModulePlaceholder';
import ToastNotification from './modules/shared/components/ToastNotification';
import AdjustmentModal from './modules/adjustments/components/AdjustmentModal';
import { useProducts } from './modules/products/hooks/useProducts';
import { adjustmentService } from './modules/adjustments/services/adjustmentService';

export default function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [toast, setToast] = useState(null);
  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false);

  const { products, stats, refreshProducts } = useProducts();

  const handleNotify = (notification) => {
    setToast(notification);
  };

  const handleQuickAdjustSubmit = async (adjustmentData) => {
    await adjustmentService.recordAdjustment(adjustmentData);
    refreshProducts();
    handleNotify({
      type: 'success',
      message: `Stock reconciled: ${adjustmentData.sku} (${adjustmentData.discrepancy >= 0 ? '+' : ''}${adjustmentData.discrepancy} ${adjustmentData.unit}) recorded in Stock Ledger!`
    });
  };

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar 
        onQuickAdjust={() => setIsQuickAdjustOpen(true)}
        activeTab={activeTab}
      />

      <div className="app-main-body">
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={setActiveTab}
          lowStockCount={stats.lowStockCount + stats.outOfStockCount}
        />

        {/* Dynamic Main Workspace */}
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardSummary onNavigate={setActiveTab} />
          )}

          {activeTab === 'products' && (
            <ProductsModule onNotify={handleNotify} />
          )}

          {activeTab === 'adjustments' && (
            <AdjustmentsModule onNotify={handleNotify} />
          )}

          {activeTab === 'ledger' && (
            <StockLedgerPreview />
          )}

          {activeTab === 'receipts' && (
            <ModulePlaceholder
              title="Receipts (Incoming Stock)"
              description="Used when goods arrive from vendors. Process: Create receipt → Add supplier & items → Validate → Stock increases automatically."
              assignedTo="Prince"
              role="Person 3 (Backend Lead)"
              features={[
                'Vendor PO matching & goods receipt note generation',
                'Multi-line item quantity receiving',
                'Stock auto-increment in designated warehouse rack',
                'Integrated with StockSense Stock Ledger'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'deliveries' && (
            <ModulePlaceholder
              title="Delivery Orders (Outgoing Stock)"
              description="Used when items leave warehouse for customer dispatch. Process: Pick items → Pack items → Validate → Stock decreases automatically."
              assignedTo="Prince"
              role="Person 3 (Backend Lead)"
              features={[
                'Sales order pick list generation',
                'Packing verification & weigh-in',
                'Automatic stock decrement upon dispatch validation',
                'Customer consignment tracking'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'transfers' && (
            <ModulePlaceholder
              title="Internal Transfers"
              description="Relocate inventory internally between facilities: Main Warehouse → Production Floor, Rack A → Rack B, or Warehouse 1 → Warehouse 2."
              assignedTo="Ameer"
              role="Person 4 (Backend + Integration Lead)"
              features={[
                'Two-step internal movement (Source Location → Destination Location)',
                'Maintains total company stock unchanged while updating storage bins',
                'Automatic ledger record emission',
                'Warehouse transfer manifest printing'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'warehouses' && (
            <ModulePlaceholder
              title="Warehouse & Facility Settings"
              description="Configure multi-warehouse hierarchies, distribution centers, and bin/rack storage layouts."
              assignedTo="Ameer"
              role="Person 4 (Backend + Integration Lead)"
              features={[
                'Multi-warehouse facility registry (Main Store, Production Floor, WH-2)',
                'Rack, shelf, and bin capacity definition',
                'Zone categorization (Raw, Finished, Fastener, Scrap)',
                'Barcoding & bin label generation'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'settings' && (
            <ModulePlaceholder
              title="System Configuration"
              description="Global inventory policies, reorder rule thresholds, API integrations, and notification webhooks."
              assignedTo="Faizan & Team"
              role="Full Team"
              features={[
                'Default unit of measure defaults',
                'Low stock threshold safety multipliers',
                'API Base URL configuration (Mock vs Live REST endpoints)',
                'Audit log retention policies'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}
        </main>
      </div>

      {/* Global Quick Adjustment Modal */}
      <AdjustmentModal
        isOpen={isQuickAdjustOpen}
        onClose={() => setIsQuickAdjustOpen(false)}
        products={products}
        onSubmit={handleQuickAdjustSubmit}
      />

      {/* Toast Notification */}
      <ToastNotification 
        toast={toast} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
}
