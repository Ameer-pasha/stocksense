import React, { useState } from 'react';
import Navbar from './modules/shared/components/Navbar';
import Sidebar from './modules/shared/components/Sidebar';
import ToastNotification from './modules/shared/components/ToastNotification';
import ModulePlaceholder from './modules/operations/ModulePlaceholder';
import StockLedgerPreview from './modules/operations/StockLedgerPreview';
import DashboardSummary from './modules/dashboard/DashboardSummary';
import ContractViewer from './modules/shared/components/ContractViewer';

// Member 2 Core Inventory & Warehouse Modules
import ProductListPage from './modules/inventory/products/pages/ProductListPage';
import CategoryListPage from './modules/inventory/categories/pages/CategoryListPage';
import WarehouseListPage from './modules/inventory/warehouses/pages/WarehouseListPage';
import LocationHierarchyPage from './modules/inventory/locations/pages/LocationHierarchyPage';
import ReorderRulesPage from './modules/inventory/reorder/pages/ReorderRulesPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [toast, setToast] = useState(null);
  const [selectedWarehouseForLocations, setSelectedWarehouseForLocations] = useState(null);
  const [reorderProductContext, setReorderProductContext] = useState(null);

  const handleNotify = (notification) => {
    setToast(notification);
  };

  const handleNavigateToLocations = (warehouseId) => {
    setSelectedWarehouseForLocations(warehouseId);
    setActiveTab('locations');
  };

  const handleNavigateToReorder = (product) => {
    setReorderProductContext(product);
    setActiveTab('reorder');
  };

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} />

      <div className="app-main-body">
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={(tab) => {
            if (tab !== 'locations') setSelectedWarehouseForLocations(null);
            if (tab !== 'reorder') setReorderProductContext(null);
            setActiveTab(tab);
          }}
        />

        {/* Dynamic Main Workspace */}
        <main className="main-content">
          {/* Member 2: Product Management */}
          {activeTab === 'products' && (
            <ProductListPage
              onNotify={handleNotify}
              onNavigateToReorder={handleNavigateToReorder}
            />
          )}

          {/* Member 2: Category Management */}
          {activeTab === 'categories' && (
            <CategoryListPage
              onNotify={handleNotify}
            />
          )}

          {/* Member 2: Warehouse Management */}
          {activeTab === 'warehouses' && (
            <WarehouseListPage
              onNotify={handleNotify}
              onNavigateToLocations={handleNavigateToLocations}
            />
          )}

          {/* Member 2: Location Management */}
          {activeTab === 'locations' && (
            <LocationHierarchyPage
              onNotify={handleNotify}
              initialWarehouseId={selectedWarehouseForLocations}
            />
          )}

          {/* Member 2: Reordering Rules */}
          {activeTab === 'reorder' && (
            <ReorderRulesPage
              onNotify={handleNotify}
              preselectedProduct={reorderProductContext}
            />
          )}

          {/* Shared DB Contract Viewer */}
          {activeTab === 'contract' && (
            <ContractViewer />
          )}

          {/* Member 3: Stock Adjustments (Explicitly Owned by Member 3) */}
          {activeTab === 'adjustments' && (
            <ModulePlaceholder
              title="Stock Adjustments"
              description="Reconcile physical stock counts against recorded inventory. Process: Initiate physical count → Record discrepancy → Manager approval → Ledger reconciliation."
              assignedTo="Member 3"
              role="Person 3 (Operations Lead)"
              features={[
                'Physical inventory cycle counts and barcode scanner input',
                'Positive & negative discrepancy reconciliation',
                'Reason code tagging (damage, spoilage, shrinkage, count error)',
                'Direct emission of adjustment entries into Member 1 Stock Ledger'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {/* Member 3: Receipts */}
          {activeTab === 'receipts' && (
            <ModulePlaceholder
              title="Receipts (Incoming Stock)"
              description="Used when goods arrive from vendors. Process: Create receipt → Add supplier & items → Validate → Stock increases automatically."
              assignedTo="Member 3"
              role="Person 3 (Operations Lead)"
              features={[
                'Vendor PO matching & goods receipt note generation',
                'Multi-line item quantity receiving',
                'Stock auto-increment in designated warehouse rack',
                'Integrated with StockSense Stock Ledger'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {/* Member 3: Deliveries */}
          {activeTab === 'deliveries' && (
            <ModulePlaceholder
              title="Delivery Orders (Outgoing Stock)"
              description="Used when items leave warehouse for customer dispatch. Process: Pick items → Pack items → Validate → Stock decreases automatically."
              assignedTo="Member 3"
              role="Person 3 (Operations Lead)"
              features={[
                'Sales order pick list generation',
                'Packing verification & weigh-in',
                'Automatic stock decrement upon dispatch validation',
                'Customer consignment tracking'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {/* Member 3: Transfers */}
          {activeTab === 'transfers' && (
            <ModulePlaceholder
              title="Internal Transfers"
              description="Relocate inventory internally between facilities: Main Warehouse → Production Floor, Rack A → Rack B, or Warehouse 1 → Warehouse 2."
              assignedTo="Member 3"
              role="Person 3 (Operations Lead)"
              features={[
                'Two-step internal movement (Source Location → Destination Location)',
                'Maintains total company stock unchanged while updating storage bins',
                'Automatic ledger record emission',
                'Warehouse transfer manifest printing'
              ]}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {/* Member 1: Stock Ledger */}
          {activeTab === 'ledger' && (
            <StockLedgerPreview />
          )}

          {/* Member 4: Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardSummary onNavigate={setActiveTab} />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      <ToastNotification 
        toast={toast} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
}
