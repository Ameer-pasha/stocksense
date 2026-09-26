import React from 'react';
import { Package, ShieldCheck, User, GitBranch, Bell } from 'lucide-react';

export default function Navbar({ onQuickAdjust, activeTab }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="brand-logo-box">
            <Package size={22} className="text-blue-400" />
          </div>
          <div>
            <span className="brand-title">StockSense</span>
            <span className="brand-badge">Modular IMS v1.0</span>
          </div>
        </div>

        <div className="navbar-facility-tag">
          <span className="facility-dot" />
          <span>All Facilities (Central Network)</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Auto Commit Sync Status Badge */}
        <div className="sync-status-badge" title="Hourly Git Auto-Sync is configured and tracking repository progress">
          <GitBranch size={13} className="text-emerald-400 animate-pulse" />
          <span>Auto-Sync: Active (60m)</span>
        </div>

        {/* Quick Adjust Button */}
        <button
          onClick={onQuickAdjust}
          className="btn-quick-adjust"
          title="Audit physical count vs system recorded quantity"
        >
          Quick Audit
        </button>

        {/* User Profile */}
        <div className="user-profile-badge">
          <div className="avatar-circle">TJ</div>
          <div className="user-info-text">
            <span className="user-name">Tarun J.</span>
            <span className="user-role">Inventory Lead (Person 2)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
