import React from 'react';
import { Tag, CornerDownRight, Edit3, Power, CheckCircle2, XCircle } from 'lucide-react';

export default function CategoryTree({
  categoryTree = [],
  onEdit,
  onToggleStatus
}) {
  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isActive = node.is_active;

    return (
      <div key={node.id} className="space-y-2">
        <div 
          className={`flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-850 transition-colors ${
            !isActive ? 'opacity-60 bg-neutral-950/40' : ''
          }`}
          style={{ marginLeft: `${depth * 28}px` }}
        >
          <div className="flex items-center gap-3">
            {depth > 0 && (
              <CornerDownRight size={16} className="text-neutral-500 shrink-0" />
            )}
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Tag size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{node.name}</span>
                {node.code && (
                  <span className="text-[11px] font-mono text-cyan-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                    {node.code}
                  </span>
                )}
                {hasChildren && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {node.children.length} subcategories
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{node.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={12} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle size={12} /> Inactive
              </span>
            )}

            <button
              type="button"
              onClick={() => onEdit(node)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              title="Edit Category"
            >
              <Edit3 size={15} />
            </button>

            <button
              type="button"
              onClick={() => onToggleStatus(node)}
              className={`p-1.5 rounded-lg transition-colors ${
                isActive 
                  ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10' 
                  : 'text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10'
              }`}
              title={isActive ? 'Deactivate Category' : 'Activate Category'}
            >
              <Power size={15} />
            </button>
          </div>
        </div>

        {hasChildren && (
          <div className="space-y-2">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (categoryTree.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-400 bg-neutral-900/40 rounded-xl border border-neutral-800">
        <Tag size={36} className="mx-auto text-neutral-600 mb-2" />
        <p className="text-sm font-medium">No categories registered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categoryTree.map((root) => renderNode(root, 0))}
    </div>
  );
}
