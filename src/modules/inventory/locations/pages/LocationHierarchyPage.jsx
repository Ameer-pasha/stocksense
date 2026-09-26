import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Warehouse, RefreshCw, Layers } from 'lucide-react';
import { useWarehouses } from '../../warehouses/hooks/useWarehouses';
import { useLocations } from '../hooks/useLocations';
import LocationTree from '../components/LocationTree';
import LocationFormModal from '../components/LocationFormModal';

export default function LocationHierarchyPage({ onNotify, initialWarehouseId = null }) {
  const { warehouses } = useWarehouses();
  const [selectedWhId, setSelectedWhId] = useState(initialWarehouseId);

  // Set default warehouse once loaded
  useEffect(() => {
    if (!selectedWhId && warehouses.length > 0) {
      setSelectedWhId(warehouses[0].id);
    }
  }, [warehouses, selectedWhId]);

  const {
    locations,
    locationTree,
    isLoading,
    fetchLocations,
    createLocation,
    updateLocation,
    toggleLocationStatus
  } = useLocations(selectedWhId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [targetParentId, setTargetParentId] = useState(null);

  const selectedWarehouse = warehouses.find(w => w.id === Number(selectedWhId));

  const handleOpenCreateRoot = () => {
    setEditingLocation(null);
    setTargetParentId(null);
    setIsFormOpen(true);
  };

  const handleAddChild = (parentNode) => {
    setEditingLocation(null);
    setTargetParentId(parentNode.id);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLocation(loc);
    setTargetParentId(loc.parent_id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (locData) => {
    if (editingLocation) {
      await updateLocation(editingLocation.id, locData);
      onNotify?.({
        type: 'success',
        message: `Updated location "${locData.name}" successfully.`
      });
    } else {
      await createLocation(locData);
      onNotify?.({
        type: 'success',
        message: `Created location "${locData.name}" (${locData.code}) in ${selectedWarehouse?.name}.`
      });
    }
  };

  const handleToggleStatus = async (loc) => {
    const nextState = !loc.is_active;
    await toggleLocationStatus(loc.id, loc.is_active);
    onNotify?.({
      type: nextState ? 'success' : 'info',
      message: `Location "${loc.name}" is now ${nextState ? 'active' : 'inactive'}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Location Hierarchy</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              Member 2 Scope
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Hierarchical multi-level layout (Warehouse → Zone → Rack / Aisle → Shelf → Bin).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchLocations(selectedWhId)}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-colors"
            title="Refresh location tree"
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateRoot}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            Add Top-Level Zone
          </button>
        </div>
      </div>

      {/* Warehouse Selector Toolbar */}
      <div className="p-4 bg-neutral-900/70 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Warehouse size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Active Warehouse Facility:</div>
            <select
              value={selectedWhId || ''}
              onChange={(e) => setSelectedWhId(Number(e.target.value))}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500 mt-0.5"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code}) {!w.is_active ? '[INACTIVE]' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div>
            Total Bins/Racks: <span className="text-white font-semibold">{locations.length}</span>
          </div>
          <div>
            Active Units: <span className="text-emerald-400 font-semibold">{locations.filter(l => l.is_active).length}</span>
          </div>
        </div>
      </div>

      {/* Interactive Location Tree */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-cyan-400" />
            <span>Interactive Spatial Layout — {selectedWarehouse?.name || 'Warehouse'}</span>
          </h3>
          <span className="text-[11px] text-neutral-500 italic">
            Click arrows to expand/collapse sub-levels. Use "+ Add Child" to nest bins under racks.
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-neutral-400">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Building spatial tree hierarchy...</p>
          </div>
        ) : (
          <LocationTree
            locationTree={locationTree}
            onAddChild={handleAddChild}
            onEdit={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      {/* Location Modal */}
      <LocationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialLocation={editingLocation}
        warehouses={warehouses}
        allLocations={locations}
        defaultWarehouseId={selectedWhId}
        defaultParentId={targetParentId}
      />
    </div>
  );
}
