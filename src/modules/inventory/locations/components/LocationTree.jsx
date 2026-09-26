import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  MapPin, 
  Plus, 
  Edit3, 
  Power, 
  CheckCircle2, 
  XCircle,
  Layers,
  Box
} from 'lucide-react';

const TYPE_COLORS = {
  zone: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  rack: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shelf: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  bin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  bay: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

export default function LocationTree({
  locationTree = [],
  onAddChild,
  onEdit,
  onToggleStatus
}) {
  const [collapsedNodes, setCollapsedNodes] = useState({});

  const toggleCollapse = (id) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = Boolean(collapsedNodes[node.id]);
    const isActive = node.is_active;
    const typeBadge = TYPE_COLORS[node.type] || 'bg-neutral-800 text-neutral-300 border-neutral-700';

    return (
      <div key={node.id} className="space-y-1.5">
        <div
          className={`flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/40 transition-colors ${
            !isActive ? 'opacity-60 bg-neutral-950/40' : ''
          }`}
          style={{ marginLeft: `${depth * 28}px` }}
        >
          {/* Node Info & Expand/Collapse */}
          <div className="flex items-center gap-2.5">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleCollapse(node.id)}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-400 transition-colors"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 inline-block" />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${typeBadge}`}>
                {node.type}
              </span>
              <span className="font-semibold text-white text-sm">{node.name}</span>
              <code className="text-xs bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-mono text-cyan-300">
                {node.code}
              </code>
            </div>
          </div>

          {/* Node Actions */}
          <div className="flex items-center gap-1.5">
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mr-1">
                <CheckCircle2 size={11} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mr-1">
                <XCircle size={11} /> Inactive
              </span>
            )}

            {/* + Add Child Node */}
            <button
              type="button"
              onClick={() => onAddChild(node)}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              title={`Add child storage unit under ${node.name}`}
            >
              <Plus size={13} />
              Add Child
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              title="Edit Location"
            >
              <Edit3 size={14} />
            </button>

            {/* Toggle Status */}
            <button
              type="button"
              onClick={() => onToggleStatus(node)}
              className={`p-1.5 rounded-lg transition-colors ${
                isActive 
                  ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10' 
                  : 'text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10'
              }`}
              title={isActive ? 'Deactivate Location' : 'Activate Location'}
            >
              <Power size={14} />
            </button>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-1.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (locationTree.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-2">
        <MapPin size={36} className="mx-auto text-neutral-600 mb-1" />
        <h4 className="text-base font-semibold text-white">No locations defined in this facility</h4>
        <p className="text-xs text-neutral-400">
          Create top-level zones or bays, then nest aisles, racks, and bins within them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {locationTree.map((root) => renderNode(root, 0))}
    </div>
  );
}
