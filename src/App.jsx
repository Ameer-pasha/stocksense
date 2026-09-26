import React, { useState } from 'react';
import Navbar from './modules/shared/components/Navbar';
import Sidebar from './modules/shared/components/Sidebar';
import ToastNotification from './modules/shared/components/ToastNotification';
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
          {/* Deliverables 1, 5, 7: Product Management & Availability View */}
          {activeTab === 'products' && (
            <ProductListPage
              onNotify={handleNotify}
              onNavigateToReorder={handleNavigateToReorder}
            />
          )}

          {/* Deliverable 2: Category Management */}
          {activeTab === 'categories' && (
            <CategoryListPage
              onNotify={handleNotify}
            />
          )}

          {/* Deliverable 3: Warehouse Management */}
          {activeTab === 'warehouses' && (
            <WarehouseListPage
              onNotify={handleNotify}
              onNavigateToLocations={handleNavigateToLocations}
            />
          )}

          {/* Deliverable 4: Location Hierarchy Management */}
          {activeTab === 'locations' && (
            <LocationHierarchyPage
              onNotify={handleNotify}
              initialWarehouseId={selectedWarehouseForLocations}
            />
          )}

          {/* Deliverable 6: Reordering Rules */}
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
