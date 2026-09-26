import React from 'react';
import { 
  Package, 
  Tag, 
  Warehouse, 
  MapPin, 
  Sliders, 
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab }) {
  const navSections = [
    {
      title: 'MASTER CATALOG',
      items: [
        { 
          id: 'products', 
          label: 'Products', 
          icon: Package, 
          description: 'Catalog, SKU, and Availability'
        },
        { 
          id: 'categories', 
          label: 'Categories', 
          icon: Tag, 
          description: 'Hierarchical Taxonomies'
        }
      ]
    },
    {
      title: 'FACILITIES & STORAGE',
      items: [
        { 
          id: 'warehouses', 
          label: 'Warehouses', 
          icon: Warehouse, 
          description: 'Distribution Centers'
        },
        { 
          id: 'locations', 
          label: 'Location Hierarchy', 
          icon: MapPin, 
          description: 'Spatial Tree (Zones & Bins)'
        }
      ]
    },
    {
      title: 'INVENTORY POLICIES',
      items: [
        { 
          id: 'reorder', 
          label: 'Reorder Rules', 
          icon: Sliders, 
          description: 'Safety Stock Min/Max Limits'
        }
      ]
    },
    {
      title: 'TEAM INTEGRATION',
      items: [
        { 
          id: 'contract', 
          label: 'Shared DB Contract', 
          icon: Database, 
          description: 'Member 2 API & Schema Agreement'
        }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        {navSections.map((sec, idx) => (
          <div key={idx} className="nav-group">
            <span className="nav-group-title">{sec.title}</span>
            <ul className="nav-list">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      className={`nav-button ${isActive ? 'active' : ''}`}
                    >
                      <div className="nav-button-label">
                        <Icon size={17} className={isActive ? 'text-blue-400' : 'text-neutral-400'} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.id !== 'contract' ? (
                          <span className="active-lead-tag">MEMBER 2</span>
                        ) : (
                          <span className="text-[10px] text-blue-400 font-mono">CONTRACT</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="team-collab-box">
          <div className="text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Member 2 Scope Active
          </div>
          <div className="text-[11px] text-neutral-400 leading-tight">
            Ownership: Product & Warehouse<br/>
            Layer: Services & APIs Upward<br/>
            Shared DB: Contract Consumption
          </div>
        </div>
      </div>
    </aside>
  );
}
