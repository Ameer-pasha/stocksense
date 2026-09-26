import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal, 
  ArrowLeftRight, 
  History, 
  Warehouse, 
  Settings, 
  User, 
  LogOut,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, lowStockCount = 0 }) {
  const navSections = [
    {
      title: 'CORE OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, owner: 'Faizan' }
      ]
    },
    {
      title: 'INVENTORY & CATALOG',
      items: [
        { 
          id: 'products', 
          label: 'Products', 
          icon: Package, 
          owner: 'Tarun ⭐', 
          badge: lowStockCount > 0 ? `${lowStockCount} alert` : null,
          badgeType: 'warning'
        },
        { 
          id: 'adjustments', 
          label: 'Stock Adjustments', 
          icon: SlidersHorizontal, 
          owner: 'Tarun ⭐' 
        }
      ]
    },
    {
      title: 'STOCK OPERATIONS',
      items: [
        { id: 'receipts', label: 'Receipts (Inbound)', icon: ArrowDownLeft, owner: 'Prince', status: 'Inbound' },
        { id: 'deliveries', label: 'Delivery Orders', icon: ArrowUpRight, owner: 'Prince', status: 'Outbound' },
        { id: 'transfers', label: 'Internal Transfers', icon: ArrowLeftRight, owner: 'Ameer', status: 'Movement' },
        { id: 'ledger', label: 'Stock Ledger (Audit)', icon: History, owner: 'Ameer', status: 'Log' }
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'warehouses', label: 'Warehouses & Bins', icon: Warehouse, owner: 'Ameer' },
        { id: 'settings', label: 'System Settings', icon: Settings, owner: 'System' }
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
                        {item.badge && (
                          <span className="nav-pill-badge">{item.badge}</span>
                        )}
                        {item.owner.includes('Tarun') && (
                          <span className="active-lead-tag">YOUR MODULE</span>
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
            Team StockSense Active
          </div>
          <div className="text-[11px] text-neutral-400 leading-tight">
            Tarun: Products & Adjustments<br/>
            Faizan: Auth & Dashboard<br/>
            Prince: Receipts & Deliveries<br/>
            Ameer: Transfers & Ledger
          </div>
        </div>
      </div>
    </aside>
  );
}
