import React from 'react';
import { Database, CheckCircle2, ShieldAlert, ArrowRight, FileText } from 'lucide-react';

export default function ContractViewer() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Shared Database Contract</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Phase 0 & Phase 1 Agreement
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Formal architectural agreement between Member 2 (Application Layer) and the Database Owner.
          </p>
        </div>
      </div>

      {/* Contract Principle Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-800/40 space-y-3">
        <div className="flex items-center gap-2.5 text-blue-300 font-bold text-sm">
          <Database size={18} />
          <span>Architectural Boundary Principle</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
          Member 2 <strong>does not design SQL tables, migrations, or database connection pools</strong>. 
          Member 2 builds everything from the <strong>service and API abstraction layer upward</strong>, 
          enforcing validation, unique SKU rules, spatial location hierarchy, and reordering rules.
        </p>
        <div className="text-[11px] text-neutral-400 flex items-center gap-2">
          <FileText size={14} className="text-blue-400" />
          <span>Full markdown document committed at: <code>stocksense/MEMBER_2_MODULE_CONTRACT.md</code></span>
        </div>
      </div>

      {/* Scope Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Member 2 Owns */}
        <div className="p-4 bg-neutral-900/70 rounded-xl border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 size={16} />
            <span>Member 2 Responsibilities (Your Ownership)</span>
          </div>
          <ul className="text-xs text-neutral-300 space-y-2 list-disc pl-4">
            <li><strong>Product Management</strong>: Create, Edit, View, Soft Deactivate, SKU search, Category filter, Availability view.</li>
            <li><strong>Category Management</strong>: Hierarchical parent/child classification and active status management.</li>
            <li><strong>Warehouse Management</strong>: Facility codes, addresses, capacities, and location aggregation.</li>
            <li><strong>Location Management</strong>: Nested tree structure (Warehouse → Zone → Rack → Shelf → Bin).</li>
            <li><strong>Reordering Rules</strong>: Min/Max safety stock thresholds and replenishment batch quantity definition.</li>
            <li><strong>API Abstraction & Validation</strong>: <code>productApi</code>, <code>categoryApi</code>, <code>warehouseApi</code>, <code>locationApi</code>, <code>reorderApi</code>.</li>
          </ul>
        </div>

        {/* Other Members Own */}
        <div className="p-4 bg-neutral-900/70 rounded-xl border border-rose-500/20 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert size={16} />
            <span>Teammate Responsibilities (Explicit Non-Ownership)</span>
          </div>
          <ul className="text-xs text-neutral-300 space-y-2 list-disc pl-4">
            <li><strong>Database & Migrations</strong>: Owned by Database Lead (tables, foreign keys, indexes).</li>
            <li><strong>Authentication & Stock Ledger</strong>: Owned by Member 1 (user login, audit logs).</li>
            <li><strong>Stock Movement & Adjustments</strong>: Owned by Member 3 (Receipts, Delivery Orders, Internal Transfers, Stock Adjustments).</li>
            <li><strong>Dashboard & Alert UI</strong>: Owned by Member 4 (KPI aggregations, alert notification popups).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
