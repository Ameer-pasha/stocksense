import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Warehouse, 
  MapPin, 
  Sliders, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  SlidersHorizontal,
  History, 
  Database,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab }) {
  const navSections = [
    {
      title: 'PRODUCT & WAREHOUSE (YOUR SCOPE)',
      items: [
        { 
          id: 'products', 
          label: 'Products', 
          icon: Package, 
          owner: 'Tarun (You)', 
          isMember2: true
        },
        { 
          id: 'categories', 
          label: 'Categories', 
          icon: Tag, 
          owner: 'Tarun (You)', 
          isMember2: true
        },
        { 
          id: 'warehouses', 
          label: 'Warehouses', 
          icon: Warehouse, 
          owner: 'Tarun (You)', 
          isMember2: true
        },
        { 
          id: 'locations', 
          label: 'Location Hierarchy', 
          icon: MapPin, 
          owner: 'Tarun (You)', 
          isMember2: true
        },
        { 
          id: 'reorder', 
          label: 'Reorder Rules', 
          icon: Sliders, 
          owner: 'Tarun (You)', 
          isMember2: true
        }
      ]
    },
    {
      title: 'OPERATIONS & MOVEMENT (MEMBER 3)',
      items: [
        { id: 'receipts', label: 'Receipts (Inbound)', icon: ArrowDownLeft, owner: 'Member 3' },
        { id: 'deliveries', label: 'Delivery Orders', icon: ArrowUpRight, owner: 'Member 3' },
        { id: 'transfers', label: 'Internal Transfers', icon: ArrowLeftRight, owner: 'Member 3' },
        { id: 'adjustments', label: 'Stock Adjustments', icon: SlidersHorizontal, owner: 'Member 3' }
      ]
    },
    {
      title: 'CORE PLATFORM (MEMBERS 1 & 4)',
      items: [
        { id: 'dashboard', label: 'Dashboard & Alerts', icon: LayoutDashboard, owner: 'Member 4' },
        { id: 'ledger', label: 'Stock Ledger (Audit)', icon: History, owner: 'Member 1' },
        { id: 'contract', label: 'Shared DB Contract', icon: Database, owner: 'DB Lead' }
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
                        {item.isMember2 ? (
                          <span className="active-lead-tag">YOUR MODULE</span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 font-mono">{item.owner}</span>
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
            Member 2 Architecture Active
          </div>
          <div className="text-[11px] text-neutral-400 leading-tight">
            Role: Product & Warehouse Application Layer<br/>
            Consumes: Shared DB Contract<br/>
            Scope: Master Data + Policies (Clean Boundary)
          </div>
        </div>
      </div>
    </aside>
  );
}
