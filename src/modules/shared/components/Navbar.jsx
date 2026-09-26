import React from 'react';
import { Package, GitBranch, Layers, ShieldCheck } from 'lucide-react';

export default function Navbar({ onAddProduct, activeTab }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="brand-logo-box">
            <Package size={22} className="text-blue-400" />
          </div>
          <div>
            <span className="brand-title">StockSense</span>
            <span className="brand-badge">Member 2: Product & Warehouse</span>
          </div>
        </div>

        <div className="navbar-facility-tag">
          <span className="facility-dot" />
          <span>Application & Service Layer Active</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Architecture Mode Badge */}
        <div className="sync-status-badge" title="Architecture decoupled from database storage">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Shared DB Consumer Contract: OK</span>
        </div>

        {/* User Profile */}
        <div className="user-profile-badge">
          <div className="avatar-circle">TJ</div>
          <div className="user-info-text">
            <span className="user-name">Tarun J.</span>
            <span className="user-role">Member 2 (Master Data Lead)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
