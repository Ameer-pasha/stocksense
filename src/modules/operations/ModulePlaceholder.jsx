import React from 'react';
import { Clock, User, ArrowRight } from 'lucide-react';

export default function ModulePlaceholder({ title, description, assignedTo, role, features = [], onGoToProducts }) {
  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">{title}</h1>
          <p className="module-subtitle">{description}</p>
        </div>
      </div>

      <div className="card-container p-8 text-center max-w-2xl mx-auto my-12">
        <div className="inline-flex p-4 rounded-full bg-blue-500/10 text-blue-400 mb-4">
          <Clock size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{title} Module Scaffold</h2>
        <p className="text-neutral-300 text-sm mb-6">
          This operational workflow is currently assigned to <strong>{assignedTo}</strong> ({role}).
          Tarun's <strong>Products</strong> &amp; <strong>Stock Adjustments</strong> modules are already completed, fully functional, and ready to link data here!
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-left mb-6">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Planned Workflow Deliverables:
          </span>
          <ul className="space-y-1.5 text-sm text-neutral-300">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={onGoToProducts}
          className="btn-primary inline-flex items-center gap-2 mx-auto"
        >
          <span>Explore Tarun's Products &amp; Adjustments</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
