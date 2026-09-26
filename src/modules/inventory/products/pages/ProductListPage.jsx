import React, { useState } from 'react';
import { Plus, Package, CheckCircle2, XCircle, Boxes, RefreshCw } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../../categories/hooks/useCategories';
import { useWarehouses } from '../../warehouses/hooks/useWarehouses';
import ProductTable from '../components/ProductTable';
import ProductFilters from '../components/ProductFilters';
import ProductForm from '../components/ProductForm';
import ProductDetailsModal from './ProductDetailsModal';

export default function ProductListPage({ onNotify, onNavigateToReorder }) {
  const { categories } = useCategories();
  const { warehouses } = useWarehouses();
  const {
    products,
    stats,
    isLoading,
    filters,
    updateFilters,
    refreshProducts,
    createProduct,
    updateProduct,
    toggleProductStatus,
    getAvailability
  } = useProducts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [inspectingProduct, setInspectingProduct] = useState(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      onNotify?.({
        type: 'success',
        message: `Updated product "${formData.name}" successfully.`
      });
    } else {
      await createProduct(formData);
      onNotify?.({
        type: 'success',
        message: `Created product "${formData.name}" (SKU: ${formData.sku}) in master catalog.`
      });
    }
  };

  const handleToggleStatus = async (product) => {
    const nextState = !product.is_active;
    await toggleProductStatus(product.id, product.is_active);
    onNotify?.({
      type: nextState ? 'success' : 'info',
      message: `${product.name} has been ${nextState ? 'activated' : 'deactivated'}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Product Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Member 2 Scope
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Master SKU catalog, category classifications, and real-time inventory availability views.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshProducts}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-colors"
            title="Refresh product list"
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Total Products</div>
            <div className="text-xl font-bold text-white tracking-wide">{stats.totalProducts}</div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Active Catalog</div>
            <div className="text-xl font-bold text-emerald-400 tracking-wide">{stats.activeProducts}</div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-400">
            <XCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Archived / Inactive</div>
            <div className="text-xl font-bold text-neutral-300 tracking-wide">{stats.inactiveProducts}</div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Boxes size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Total In-Stock Units</div>
            <div className="text-xl font-bold text-indigo-300 tracking-wide font-mono">
              {stats.totalStockUnits.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filters */}
      <ProductFilters
        filters={filters}
        categories={categories}
        warehouses={warehouses}
        onChange={updateFilters}
        onReset={() => updateFilters({ search: '', category_id: '', warehouse_id: '', is_active: '' })}
      />

      {/* Product Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onViewAvailability={(prod) => setInspectingProduct(prod)}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
      />

      {/* Product Form Modal (Create / Edit) */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialProduct={editingProduct}
        categories={categories}
      />

      {/* Product Details & Availability Modal */}
      <ProductDetailsModal
        isOpen={Boolean(inspectingProduct)}
        onClose={() => setInspectingProduct(null)}
        product={inspectingProduct}
        onFetchAvailability={getAvailability}
        onGoToReorder={onNavigateToReorder}
      />
    </div>
  );
}
