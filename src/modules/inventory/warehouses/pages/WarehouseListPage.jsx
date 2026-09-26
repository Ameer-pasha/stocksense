import React, { useState } from 'react';
import { Plus, Warehouse, RefreshCw, Layers } from 'lucide-react';
import { useWarehouses } from '../hooks/useWarehouses';
import WarehouseTable from '../components/WarehouseTable';
import WarehouseFormModal from '../components/WarehouseFormModal';

export default function WarehouseListPage({ onNotify, onNavigateToLocations }) {
  const {
    warehouses,
    isLoading,
    refreshWarehouses,
    createWarehouse,
    updateWarehouse,
    toggleWarehouseStatus
  } = useWarehouses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (wh) => {
    setEditingWarehouse(wh);
    setIsFormOpen(true);
  };

  const handleSubmit = async (whData) => {
    if (editingWarehouse) {
      await updateWarehouse(editingWarehouse.id, whData);
      onNotify?.({
        type: 'success',
        message: `Warehouse "${whData.name}" updated successfully.`
      });
    } else {
      await createWarehouse(whData);
      onNotify?.({
        type: 'success',
        message: `Warehouse "${whData.name}" (${whData.code}) registered successfully.`
      });
    }
  };

  const handleToggleStatus = async (wh) => {
    const nextState = !wh.is_active;
    await toggleWarehouseStatus(wh.id, wh.is_active);
    onNotify?.({
      type: nextState ? 'success' : 'info',
      message: `Warehouse "${wh.name}" is now ${nextState ? 'active' : 'inactive'}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Warehouse Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Member 2 Scope
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure distribution centers, manufacturing facilities, storage capacities, and sub-location structures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshWarehouses}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-colors"
            title="Refresh warehouses"
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Facilities Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Warehouse size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Total Warehouses</div>
            <div className="text-xl font-bold text-white">{warehouses.length} Facilities</div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Active Facilities</div>
            <div className="text-xl font-bold text-emerald-400">
              {warehouses.filter(w => w.is_active).length} Active
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Warehouse size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Total Storage Footprint</div>
            <div className="text-xl font-bold text-white font-mono">
              {warehouses.reduce((acc, w) => acc + (w.capacity_sqft || 0), 0).toLocaleString()} <span className="text-xs font-normal text-neutral-400">sq ft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Table */}
      <WarehouseTable
        warehouses={warehouses}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        onViewLocations={onNavigateToLocations}
      />

      {/* Warehouse Modal */}
      <WarehouseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialWarehouse={editingWarehouse}
      />
    </div>
  );
}
