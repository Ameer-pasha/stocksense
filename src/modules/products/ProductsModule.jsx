import React, { useState } from 'react';
import { useProducts } from './hooks/useProducts';
import ProductStatsCard from './components/ProductStatsCard';
import LowStockAlertBanner from './components/LowStockAlertBanner';
import ProductListTable from './components/ProductListTable';
import ProductFormModal from './components/ProductFormModal';
import LocationStockDrawer from './components/LocationStockDrawer';
import AdjustmentModal from '../adjustments/components/AdjustmentModal';
import { adjustmentService } from '../adjustments/services/adjustmentService';

export default function ProductsModule({ onNotify }) {
  const {
    products,
    filteredProducts,
    loading,
    error,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    onlyLowStock,
    setOnlyLowStock,
    selectedLocation,
    setSelectedLocation,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addProduct,
    editProduct,
    removeProduct,
    refreshProducts
  } = useProducts();

  // Modals / Drawers state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentTargetProduct, setAdjustmentTargetProduct] = useState(null);
  const [adjustmentTargetLocation, setAdjustmentTargetLocation] = useState(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to remove "${product.name}" (${product.sku}) from catalog?`)) {
      try {
        await removeProduct(product.id);
        onNotify?.({ type: 'success', message: `Product "${product.name}" removed successfully.` });
      } catch (err) {
        onNotify?.({ type: 'error', message: err.message || 'Error deleting product' });
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    if (editingProduct) {
      await editProduct(editingProduct.id, productData);
      onNotify?.({ type: 'success', message: `Product "${productData.name}" updated successfully.` });
    } else {
      await addProduct(productData);
      onNotify?.({ type: 'success', message: `Product "${productData.name}" created and placed into warehouse.` });
    }
  };

  const handleQuickAdjust = (product, location = null) => {
    setAdjustmentTargetProduct(product);
    setAdjustmentTargetLocation(location);
    setIsAdjustmentOpen(true);
  };

  const handleAdjustmentSubmit = async (adjustmentData) => {
    await adjustmentService.recordAdjustment(adjustmentData);
    refreshProducts();
    onNotify?.({ 
      type: 'success', 
      message: `Adjustment validated: ${adjustmentData.discrepancy >= 0 ? '+' : ''}${adjustmentData.discrepancy} ${adjustmentData.unit} applied & logged to Stock Ledger!` 
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="module-container">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Products & Inventory Catalog</h1>
          <p className="module-subtitle">
            Manage SKUs, product categories, reordering thresholds, and warehouse location breakdowns.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <ProductStatsCard 
        stats={stats} 
        onFilterLowStock={() => setOnlyLowStock(!onlyLowStock)}
        isLowStockActive={onlyLowStock}
      />

      {/* Low Stock Warning Banner */}
      <LowStockAlertBanner 
        lowStockList={stats.lowStockList} 
        onSelectProduct={(p) => setSelectedProductForDrawer(p)}
        onQuickAdjust={(p) => handleQuickAdjust(p)}
      />

      {/* Products Table */}
      <ProductListTable
        products={filteredProducts}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onlyLowStock={onlyLowStock}
        onToggleLowStock={setOnlyLowStock}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onAddProduct={handleOpenAdd}
        onEditProduct={handleOpenEdit}
        onDeleteProduct={handleDelete}
        onViewLocations={(p) => setSelectedProductForDrawer(p)}
        onQuickAdjust={(p) => handleQuickAdjust(p)}
        onRefresh={refreshProducts}
      />

      {/* Create / Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Location Stock Breakdown Drawer */}
      <LocationStockDrawer
        product={selectedProductForDrawer}
        isOpen={!!selectedProductForDrawer}
        onClose={() => setSelectedProductForDrawer(null)}
        onQuickAdjust={handleQuickAdjust}
      />

      {/* Stock Adjustment Modal */}
      <AdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={() => {
          setIsAdjustmentOpen(false);
          setAdjustmentTargetProduct(null);
          setAdjustmentTargetLocation(null);
        }}
        products={products}
        initialProduct={adjustmentTargetProduct}
        initialLocation={adjustmentTargetLocation}
        onSubmit={handleAdjustmentSubmit}
      />
    </div>
  );
}
