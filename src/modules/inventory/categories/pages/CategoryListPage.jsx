import React, { useState } from 'react';
import { Plus, Tag, RefreshCw, Layers } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import CategoryTree from '../components/CategoryTree';
import CategoryFormModal from '../components/CategoryFormModal';

export default function CategoryListPage({ onNotify }) {
  const {
    categories,
    categoryTree,
    isLoading,
    refreshCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus
  } = useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleSubmit = async (catData) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, catData);
      onNotify?.({
        type: 'success',
        message: `Category "${catData.name}" updated successfully.`
      });
    } else {
      await createCategory(catData);
      onNotify?.({
        type: 'success',
        message: `Category "${catData.name}" created successfully.`
      });
    }
  };

  const handleToggleStatus = async (cat) => {
    const nextState = !cat.is_active;
    await toggleCategoryStatus(cat.id, cat.is_active);
    onNotify?.({
      type: nextState ? 'success' : 'info',
      message: `Category "${cat.name}" has been ${nextState ? 'activated' : 'deactivated'}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Category Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Member 2 Scope
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Organize catalog products into hierarchical parent/child categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshCategories}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-colors"
            title="Refresh categories"
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Total Registered Categories</div>
            <div className="text-lg font-bold text-white">{categories.length} Categories</div>
          </div>
        </div>
        <div className="text-xs text-neutral-400">
          Active: <span className="text-emerald-400 font-semibold">{categories.filter(c => c.is_active).length}</span> | 
          Inactive: <span className="text-rose-400 font-semibold ml-1">{categories.filter(c => !c.is_active).length}</span>
        </div>
      </div>

      {/* Category Tree Hierarchy */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
          Classification Hierarchy View
        </h3>
        {isLoading ? (
          <div className="py-16 text-center text-neutral-400">
            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading category tree...</p>
          </div>
        ) : (
          <CategoryTree
            categoryTree={categoryTree}
            onEdit={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      {/* Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialCategory={editingCategory}
        allCategories={categories}
      />
    </div>
  );
}
