import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, Globe, Wifi } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export default function Navbar({ activeTab }) {
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      const live = await apiClient.checkHealth();
      if (mounted) setIsBackendConnected(live);
    };

    probe();
    const interval = setInterval(probe, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

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
        {/* Real-time Integration Status Badge */}
        <div 
          className="sync-status-badge cursor-help" 
          title={isBackendConnected 
            ? `Connected to live backend REST API at ${apiClient.getBaseUrl()}` 
            : `Running in Standalone Mock Mode. Ready to connect to backend at ${apiClient.getBaseUrl()}`
          }
        >
          {isBackendConnected ? (
            <>
              <Wifi size={13} className="text-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-medium">REST API: Live (Port 8000)</span>
            </>
          ) : (
            <>
              <Globe size={13} className="text-blue-400" />
              <span className="text-neutral-300">Endpoints: Open (Ready for Team API)</span>
            </>
          )}
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
