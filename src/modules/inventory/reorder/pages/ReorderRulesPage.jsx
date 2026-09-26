import React, { useState } from 'react';
import { Plus, Sliders, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useReorderRules } from '../hooks/useReorderRules';
import { useProducts } from '../../products/hooks/useProducts';
import { useLocations } from '../../locations/hooks/useLocations';
import ReorderRuleList from '../components/ReorderRuleList';
import ReorderRuleFormModal from '../components/ReorderRuleFormModal';

export default function ReorderRulesPage({ onNotify, preselectedProduct = null }) {
  const { rules, breachCount, isLoading, refreshRules, createRule, deleteRule } = useReorderRules();
  const { products } = useProducts();
  const { locations } = useLocations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const filteredRules = statusFilter 
    ? rules.filter(r => r.status === statusFilter)
    : rules;

  const handleCreateRule = async (ruleData) => {
    await createRule(ruleData);
    onNotify?.({
      type: 'success',
      message: 'Reordering rule saved successfully.'
    });
  };

  const handleDeleteRule = async (ruleId) => {
    await deleteRule(ruleId);
    onNotify?.({
      type: 'info',
      message: 'Reordering rule deleted.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Reordering Rules</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              Member 2 Scope
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure replenishment policies (Min/Max thresholds & batch quantities) consumed by inventory alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refreshRules()}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-colors"
            title="Refresh rules"
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            Configure Rule
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sliders size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Total Configured Rules</div>
            <div className="text-xl font-bold text-white">{rules.length} Policies</div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Threshold Breaches (Below Min)</div>
            <div className="text-xl font-bold text-rose-400">{breachCount} Items</div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">All Rules ({rules.length})</option>
              <option value="breached">Below Min Only ({breachCount})</option>
              <option value="adequate">Adequate Stock</option>
              <option value="surplus">Overstocked</option>
            </select>
          </div>
          <span className="text-[11px] text-neutral-500 italic max-w-[140px] text-right">
            Consumed by Member 4 Alert Engine
          </span>
        </div>
      </div>

      {/* Rules Table */}
      <ReorderRuleList
        rules={filteredRules}
        isLoading={isLoading}
        onDeleteRule={handleDeleteRule}
      />

      {/* Rule Form Modal */}
      <ReorderRuleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateRule}
        products={products}
        locations={locations}
        preselectedProduct={preselectedProduct}
      />
    </div>
  );
}
