/**
 * StockSense Enterprise Desktop Application Logic & State Engine
 * Member 4 Focus: Frontend, Dashboard, Analytics, Alerts & Intelligence
 */

// ============================================================================
// 1. DEFAULT SEED DATA (Matching UI Diagram Entities)
// ============================================================================

const DEFAULT_CATEGORIES = [
  { id: 'CAT-1', name: 'Electronics & Sensors', count: 4, value: 84500 },
  { id: 'CAT-2', name: 'Mechanical & Bearings', count: 3, value: 42300 },
  { id: 'CAT-3', name: 'Hardware & Fasteners', count: 2, value: 12400 },
  { id: 'CAT-4', name: 'Raw Metals & Racks', count: 2, value: 28900 },
  { id: 'CAT-5', name: 'Automotive Components', count: 2, value: 16850 }
];

const DEFAULT_WAREHOUSES = [
  {
    id: 'WH-MAIN',
    name: 'Main Warehouse HQ',
    code: 'WH-MAIN-01',
    zone: 'Zone A (Bay 1-12)',
    capacity: 88,
    skus: 11,
    manager: 'Ameer Pasha',
    location: 'Building A, Central Logistics Park'
  },
  {
    id: 'WH-NORTH',
    name: 'North Logistics Hub',
    code: 'WH-NORTH-02',
    zone: 'Zone B (Bay 1-8)',
    capacity: 64,
    skus: 8,
    manager: 'Prince',
    location: 'North Industrial Sector 4'
  },
  {
    id: 'WH-SOUTH',
    name: 'South Depot & Storage',
    code: 'WH-SOUTH-03',
    zone: 'Zone C (Cold Storage)',
    capacity: 42,
    skus: 5,
    manager: 'Faizan',
    location: 'Harbor Gateway Bay 9'
  },
  {
    id: 'WH-EAST',
    name: 'East Coast Distribution',
    code: 'WH-EAST-04',
    zone: 'Zone D (High-Bay)',
    capacity: 35,
    skus: 4,
    manager: 'Tarun',
    location: 'Airport Cargo Terminal 3'
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'PRD-000101',
    name: 'Solar Inverter Module V3',
    sku: 'SLR-INV-300',
    category: 'Electronics & Sensors',
    warehouse: 'WH-MAIN',
    bin: 'A-01-12',
    stock: 240,
    minStock: 50,
    price: 340.00,
    cost: 210.00,
    barcode: '890123456789',
    status: 'IN_STOCK',
    description: 'High-efficiency multi-phase solar inverter control board.'
  },
  {
    id: 'PRD-000102',
    name: 'Industrial Pressure Sensor 500PSI',
    sku: 'SEN-PRS-500',
    category: 'Electronics & Sensors',
    warehouse: 'WH-MAIN',
    bin: 'A-02-04',
    stock: 180,
    minStock: 40,
    price: 185.00,
    cost: 110.00,
    barcode: '890123456790',
    status: 'IN_STOCK',
    description: 'Stainless steel submersible pressure transducer.'
  },
  {
    id: 'PRD-000103',
    name: 'Roxon 290 Bearings',
    sku: 'BRG-ROX-290',
    category: 'Mechanical & Bearings',
    warehouse: 'WH-NORTH',
    bin: 'B-04-18',
    stock: 12,
    minStock: 25,
    price: 89.50,
    cost: 45.00,
    barcode: '890123456791',
    status: 'LOW_STOCK',
    description: 'High-torque double sealed cylindrical roller bearing.'
  },
  {
    id: 'PRD-000104',
    name: 'Test Profile N900 Sensor',
    sku: 'TST-PRF-900',
    category: 'Electronics & Sensors',
    warehouse: 'WH-MAIN',
    bin: 'A-05-22',
    stock: 0,
    minStock: 15,
    price: 499.00,
    cost: 320.00,
    barcode: '890123456792',
    status: 'OUT_OF_STOCK',
    description: 'Optical profile testing transducer unit.'
  },
  {
    id: 'PRD-000105',
    name: 'Hydraulic Actuator Cylinder 40mm',
    sku: 'ACT-HYD-040',
    category: 'Mechanical & Bearings',
    warehouse: 'WH-SOUTH',
    bin: 'C-01-09',
    stock: 95,
    minStock: 20,
    price: 260.00,
    cost: 160.00,
    barcode: '890123456793',
    status: 'IN_STOCK',
    description: 'Double acting heavy duty pneumatic & hydraulic ram.'
  },
  {
    id: 'PRD-000106',
    name: 'Reinforced Aluminum Rack Rails',
    sku: 'RCK-ALU-200',
    category: 'Raw Metals & Racks',
    warehouse: 'WH-EAST',
    bin: 'D-02-14',
    stock: 310,
    minStock: 60,
    price: 65.00,
    cost: 32.00,
    barcode: '890123456794',
    status: 'IN_STOCK',
    description: '6061 T6 structural extruded warehouse modular rails.'
  },
  {
    id: 'PRD-000107',
    name: 'Titanium Fastener Hex Bolts M8',
    sku: 'FST-TIT-M08',
    category: 'Hardware & Fasteners',
    warehouse: 'WH-MAIN',
    bin: 'A-08-30',
    stock: 14,
    minStock: 50,
    price: 18.50,
    cost: 9.00,
    barcode: '890123456795',
    status: 'LOW_STOCK',
    description: 'Grade 5 aircraft-grade anti-corrosive bolts box of 50.'
  },
  {
    id: 'PRD-000108',
    name: 'Motor Brake Assembly 3-Phase',
    sku: 'MTR-BRK-003',
    category: 'Automotive Components',
    warehouse: 'WH-NORTH',
    bin: 'B-06-02',
    stock: 75,
    minStock: 15,
    price: 420.00,
    cost: 270.00,
    barcode: '890123456796',
    status: 'IN_STOCK',
    description: 'Electromagnetic fail-safe braking unit for conveyors.'
  }
];

const DEFAULT_RECEIPTS = [
  {
    id: 'REC-2026-001',
    supplier: 'Apex Global Microelectronics',
    warehouse: 'WH-MAIN',
    date: '2026-09-24',
    itemsCount: 150,
    totalValue: 51000.00,
    status: 'Done',
    items: [
      { productId: 'PRD-000101', name: 'Solar Inverter Module V3', qty: 150, cost: 210.00 }
    ]
  },
  {
    id: 'REC-2026-002',
    supplier: 'Vanderbilt Heavy Castings',
    warehouse: 'WH-NORTH',
    date: '2026-09-27',
    itemsCount: 50,
    totalValue: 4475.00,
    status: 'Ready',
    items: [
      { productId: 'PRD-000103', name: 'Roxon 290 Bearings', qty: 50, cost: 45.00 }
    ]
  },
  {
    id: 'REC-2026-003',
    supplier: 'Matrix Fasteners Corp',
    warehouse: 'WH-MAIN',
    date: '2026-09-30',
    itemsCount: 100,
    totalValue: 1850.00,
    status: 'Draft',
    items: [
      { productId: 'PRD-000107', name: 'Titanium Fastener Hex Bolts M8', qty: 100, cost: 9.00 }
    ]
  }
];

const DEFAULT_DELIVERIES = [
  {
    id: 'DEL-2026-089',
    customer: 'Tesla Gigafactory Texas',
    warehouse: 'WH-MAIN',
    date: '2026-09-25',
    itemsDispatched: '40 x Solar Inverter V3',
    status: 'Done',
    items: [
      { productId: 'PRD-000101', qty: 40 }
    ]
  },
  {
    id: 'DEL-2026-090',
    customer: 'Boeing Space Logistics',
    warehouse: 'WH-MAIN',
    date: '2026-09-26',
    itemsDispatched: '10 x Fastener Bolts M8',
    status: 'Done',
    items: [
      { productId: 'PRD-000107', qty: 10 }
    ]
  },
  {
    id: 'DEL-2026-091',
    customer: 'Siemens Energy Hub',
    warehouse: 'WH-SOUTH',
    date: '2026-09-28',
    itemsDispatched: '15 x Hydraulic Actuator',
    status: 'Packing',
    items: [
      { productId: 'PRD-000105', qty: 15 }
    ]
  },
  {
    id: 'DEL-2026-092',
    customer: 'Amazon Robotics Center',
    warehouse: 'WH-EAST',
    date: '2026-09-29',
    itemsDispatched: '30 x Rack Rails',
    status: 'Draft',
    items: [
      { productId: 'PRD-000106', qty: 30 }
    ]
  }
];

const DEFAULT_TRANSFERS = [
  {
    id: 'TRF-2026-042',
    source: 'WH-MAIN',
    dest: 'WH-NORTH',
    product: 'Solar Inverter Module V3',
    productId: 'PRD-000101',
    qty: 25,
    date: '2026-09-25',
    status: 'Completed',
    reason: 'Fulfill North Hub regional spike'
  },
  {
    id: 'TRF-2026-043',
    source: 'WH-EAST',
    dest: 'WH-MAIN',
    product: 'Reinforced Aluminum Rack Rails',
    productId: 'PRD-000106',
    qty: 40,
    date: '2026-09-26',
    status: 'In-Transit',
    reason: 'Stock balancing'
  }
];

const DEFAULT_ADJUSTMENTS = [
  {
    id: 'ADJ-2026-011',
    product: 'Roxon 290 Bearings',
    productId: 'PRD-000103',
    warehouse: 'WH-NORTH',
    systemStock: 15,
    realStock: 12,
    delta: -3,
    reason: 'Damaged Goods Write-off',
    auditor: 'Ameer Pasha',
    date: '2026-09-25 14:32'
  },
  {
    id: 'ADJ-2026-012',
    product: 'Industrial Pressure Sensor 500PSI',
    productId: 'PRD-000102',
    warehouse: 'WH-MAIN',
    systemStock: 175,
    realStock: 180,
    delta: +5,
    reason: 'Found Unrecorded Stock',
    auditor: 'Prince',
    date: '2026-09-24 10:15'
  }
];

const DEFAULT_HISTORY = [
  {
    timestamp: '2026-09-26 09:14',
    type: 'DELIVERY',
    ref: 'DEL-2026-090',
    product: 'Titanium Fastener Hex Bolts M8',
    sku: 'FST-TIT-M08',
    path: 'WH-MAIN → Boeing Space Logistics',
    delta: '-10 units',
    balance: '14 units',
    user: 'Faizan'
  },
  {
    timestamp: '2026-09-25 16:40',
    type: 'TRANSFER',
    ref: 'TRF-2026-042',
    product: 'Solar Inverter Module V3',
    sku: 'SLR-INV-300',
    path: 'WH-MAIN → WH-NORTH',
    delta: '-25 / +25',
    balance: '240 units',
    user: 'Ameer Pasha'
  },
  {
    timestamp: '2026-09-25 14:32',
    type: 'ADJUSTMENT',
    ref: 'ADJ-2026-011',
    product: 'Roxon 290 Bearings',
    sku: 'BRG-ROX-290',
    path: 'WH-NORTH (Audit Adjustment)',
    delta: '-3 units',
    balance: '12 units',
    user: 'Ameer Pasha'
  },
  {
    timestamp: '2026-09-25 11:20',
    type: 'DELIVERY',
    ref: 'DEL-2026-089',
    product: 'Solar Inverter Module V3',
    sku: 'SLR-INV-300',
    path: 'WH-MAIN → Tesla Gigafactory Texas',
    delta: '-40 units',
    balance: '265 units',
    user: 'Prince'
  },
  {
    timestamp: '2026-09-24 15:00',
    type: 'RECEIPT',
    ref: 'REC-2026-001',
    product: 'Solar Inverter Module V3',
    sku: 'SLR-INV-300',
    path: 'Apex Global → WH-MAIN',
    delta: '+150 units',
    balance: '305 units',
    user: 'Tarun'
  }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: 'Low Stock Alert: Roxon 290 Bearings', desc: 'Current stock is 12 (Threshold: 25). Reorder suggested.', time: '10m ago', type: 'warning' },
  { id: 2, title: 'Out of Stock: Test Profile N900', desc: 'Warehouse Main has 0 units available for fulfillment.', time: '1h ago', type: 'danger' },
  { id: 3, title: 'Inbound Shipment Arriving', desc: 'PO #REC-2026-002 scheduled at North Hub tomorrow.', time: '3h ago', type: 'info' }
];

// ============================================================================
// 2. STATE MANAGER & PERSISTENCE
// ============================================================================

class AppState {
  constructor() {
    this.loadState();
  }

  loadState() {
    this.categories = JSON.parse(localStorage.getItem('stocksense_categories')) || DEFAULT_CATEGORIES;
    this.warehouses = JSON.parse(localStorage.getItem('stocksense_warehouses')) || DEFAULT_WAREHOUSES;
    this.products = JSON.parse(localStorage.getItem('stocksense_products')) || DEFAULT_PRODUCTS;
    this.receipts = JSON.parse(localStorage.getItem('stocksense_receipts')) || DEFAULT_RECEIPTS;
    this.deliveries = JSON.parse(localStorage.getItem('stocksense_deliveries')) || DEFAULT_DELIVERIES;
    this.transfers = JSON.parse(localStorage.getItem('stocksense_transfers')) || DEFAULT_TRANSFERS;
    this.adjustments = JSON.parse(localStorage.getItem('stocksense_adjustments')) || DEFAULT_ADJUSTMENTS;
    this.history = JSON.parse(localStorage.getItem('stocksense_history')) || DEFAULT_HISTORY;
    this.notifications = JSON.parse(localStorage.getItem('stocksense_notifs')) || DEFAULT_NOTIFICATIONS;
    this.currentWarehouse = 'ALL';
    this.theme = localStorage.getItem('stocksense_theme') || 'light';
    this.currentUser = JSON.parse(localStorage.getItem('stocksense_user')) || { id: 'usr-002', name: 'Member 4', email: 'member4@stocksense.io', role: 'admin' };
    this.authToken = localStorage.getItem('stocksense_token') || null;
  }

  saveState() {
    localStorage.setItem('stocksense_categories', JSON.stringify(this.categories));
    localStorage.setItem('stocksense_warehouses', JSON.stringify(this.warehouses));
    localStorage.setItem('stocksense_products', JSON.stringify(this.products));
    localStorage.setItem('stocksense_receipts', JSON.stringify(this.receipts));
    localStorage.setItem('stocksense_deliveries', JSON.stringify(this.deliveries));
    localStorage.setItem('stocksense_transfers', JSON.stringify(this.transfers));
    localStorage.setItem('stocksense_adjustments', JSON.stringify(this.adjustments));
    localStorage.setItem('stocksense_history', JSON.stringify(this.history));
    localStorage.setItem('stocksense_notifs', JSON.stringify(this.notifications));
    localStorage.setItem('stocksense_theme', this.theme);
    localStorage.setItem('stocksense_user', JSON.stringify(this.currentUser));
    if (this.authToken) localStorage.setItem('stocksense_token', this.authToken);
    else localStorage.removeItem('stocksense_token');
  }

  resetDemo() {
    localStorage.clear();
    this.loadState();
    this.saveState();
  }
}

const state = new AppState();

// ============================================================================
// 2.5. BACKEND REST API CLIENT & REAL-TIME RECONCILIATION
// ============================================================================

const getApiBaseUrl = () => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('stocksense_api_url')) {
    return localStorage.getItem('stocksense_api_url');
  }
  if (typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = {
  baseUrl: API_BASE_URL,
  isOnline: false,

  async request(endpoint, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 3500);

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      };

      const token = localStorage.getItem('stocksense_token') || localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errorMsg = errData.error || errData.message || `API Error: HTTP ${res.status}`;
        console.warn(`[StockSense API] ${options.method || 'GET'} ${endpoint} failed (${res.status}):`, errorMsg);
        if (res.status === 400 || res.status === 409 || errData.shortage) {
          showToast(errorMsg, 'danger');
        }
        return { success: false, error: errorMsg, shortage: !!errData.shortage, status: res.status };
      }
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async checkHealth() {
    const data = await this.request('/health', { timeout: 2000 });
    this.isOnline = !!(data && (data.status === 'ok' || data.status === 'online'));
    updateApiStatusBadge(this.isOnline);
    return this.isOnline;
  },

  async syncFromBackend(silent = false) {
    if (!silent) updateApiStatusBadge('syncing');
    const isOnline = await this.checkHealth();
    if (!isOnline) {
      if (!silent) showToast('Backend API is offline (localhost:5000). Running in local mode.');
      return false;
    }

    try {
      const [prodRes, whRes, catRes, adjRes, recRes, delRes, trfRes, alertRes, histRes] = await Promise.all([
        this.request('/products'),
        this.request('/warehouses'),
        this.request('/categories'),
        this.request('/adjustments'),
        this.request('/receipts'),
        this.request('/deliveries'),
        this.request('/transfers'),
        this.request('/alerts'),
        this.request('/history')
      ]);

      if (prodRes && prodRes.data && prodRes.data.length > 0) state.products = prodRes.data;
      if (whRes && whRes.data && whRes.data.length > 0) state.warehouses = whRes.data;
      if (catRes && catRes.data && catRes.data.length > 0) state.categories = catRes.data;
      if (adjRes && adjRes.data && adjRes.data.length > 0) state.adjustments = adjRes.data;
      if (recRes && recRes.data && recRes.data.length > 0) state.receipts = recRes.data;
      if (delRes && delRes.data && delRes.data.length > 0) state.deliveries = delRes.data;
      if (trfRes && trfRes.data && trfRes.data.length > 0) state.transfers = trfRes.data;
      if (histRes && histRes.data && histRes.data.length > 0) state.history = histRes.data;
      if (alertRes && alertRes.data && alertRes.data.length > 0) {
        state.notifications = alertRes.data.map((a, i) => ({
          id: i + 1,
          title: a.title,
          desc: a.desc,
          time: a.time || 'Live',
          type: a.type || 'warning'
        }));
      }

      state.saveState();
      populateCategorySelects();
      populateWarehouseFilter();
      renderAllViews();
      renderNotifications();
      if (!silent) showToast('Synchronized with StockSense Backend API!');
      return true;
    } catch (err) {
      console.warn('[StockSense Sync Error]', err);
      return false;
    }
  }
};

function updateApiStatusBadge(status) {
  const badge = document.getElementById('apiStatusBadge');
  const dot = document.getElementById('apiStatusDot');
  const text = document.getElementById('apiStatusText');
  if (!badge || !dot || !text) return;

  if (status === 'syncing') {
    dot.className = 'api-status-dot syncing';
    text.textContent = 'API: Syncing...';
    badge.title = 'Connecting to backend API...';
  } else if (status === true) {
    dot.className = 'api-status-dot online';
    text.textContent = 'API: Connected';
    badge.title = `Connected to StockSense Backend API (${apiClient.baseUrl}) - Click to re-sync`;
  } else {
    dot.className = 'api-status-dot offline';
    text.textContent = 'API: Offline (Local)';
    badge.title = `Backend server not reachable at ${apiClient.baseUrl} - Running in offline local storage mode. Click to retry connection.`;
  }
}

// Global Charts instances
let stockTrendsChart = null;
let inventoryDonutChart = null;
let burnRateChart = null;

// ============================================================================
// 3. INITIALIZATION & NAVIGATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  updateUserProfileUI(state.currentUser);
  populateCategorySelects();
  populateWarehouseFilter();
  renderAllViews();
  initCharts();
  renderNotifications();
  setupKeyboardShortcuts();
  setupNavKeyboardAccessibility();

  // Auto-connect to backend API silently on startup
  apiClient.syncFromBackend(true);

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-wrapper')) {
      document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('active'));
    }
  });
});

function setupNavKeyboardAccessibility() {
  const navContainer = document.querySelector('.sidebar-nav') || document.querySelector('.top-nav-tabs');
  if (!navContainer) return;

  navContainer.addEventListener('keydown', (e) => {
    const tabs = Array.from(navContainer.querySelectorAll('.nav-tab'));
    const currentIndex = tabs.findIndex(tab => tab === document.activeElement);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = tabs.length - 1;
    }

    if (targetIndex !== -1) {
      tabs[targetIndex].focus();
      const view = tabs[targetIndex].getAttribute('data-view');
      if (view) navigateTo(view);
    }
  });
}

function navigateTo(viewId, params = {}) {
  // Update Tab Styling & ARIA Accessibility Attributes
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const isTarget = tab.getAttribute('data-view') === viewId;
    if (isTarget) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
    } else {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    }
  });

  // Update App View Visibility
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
    view.setAttribute('aria-hidden', 'true');
  });
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
    targetView.setAttribute('aria-hidden', 'false');
  }

  // Update Topbar Breadcrumb
  const breadcrumb = document.getElementById('currentViewBreadcrumb');
  if (breadcrumb) {
    const titles = {
      dashboard: 'Operations & Inventory Analytics',
      products: 'Products & SKU Catalog Matrix',
      warehouses: 'Warehouse Infrastructure & Capacity',
      receipts: 'Inbound Receipts & Intake Dock',
      deliveries: 'Outbound Deliveries & Dispatch',
      transfers: 'Inter-Warehouse Transfers (2PC)',
      adjustments: 'Stock Adjustments & Physical Audits',
      history: 'Immutable Double-Entry Stock Ledger',
      insights: 'Analytics, ABC Matrix & Velocity',
      auth: 'Authentication & Session Center'
    };
    breadcrumb.textContent = titles[viewId] || (viewId.charAt(0).toUpperCase() + viewId.slice(1));
  }

  if (viewId === 'auth') {
    updateAuthPageUI();
  }

  // If params passed (like filterStatus)
  if (viewId === 'products' && params.filterStatus) {
    const statusSelect = document.getElementById('productStatusFilter');
    if (statusSelect) {
      statusSelect.value = params.filterStatus;
      filterProducts();
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleWarehouseChange(whId) {
  state.currentWarehouse = whId;
  renderAllViews();
  showToast(`Switched scope to ${whId === 'ALL' ? 'All Warehouses' : whId}`);
}

function renderAllViews() {
  renderDashboard();
  renderProducts();
  renderWarehouses();
  renderReceipts();
  renderDeliveries();
  renderTransfers();
  renderAdjustments();
  renderHistory();
  renderCategoryManager();
  updateCharts();
}

// ============================================================================
// 4. VIEW RENDERERS (Member 4 Focus: Dashboard, Analytics & Alerts)
// ============================================================================

/* --- DASHBOARD (Screen 7) --- */
function renderDashboard() {
  const filteredProducts = getScopedProducts();
  
  let totalStockUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalValuation = 0;

  filteredProducts.forEach(p => {
    totalStockUnits += p.stock;
    totalValuation += (p.stock * p.price);
    if (p.stock === 0) {
      outOfStockCount++;
      p.status = 'OUT_OF_STOCK';
    } else if (p.stock <= p.minStock) {
      lowStockCount++;
      p.status = 'LOW_STOCK';
    } else {
      p.status = 'IN_STOCK';
    }
  });

  const kpiTotalStock = document.getElementById('kpiTotalStock');
  const kpiLowStock = document.getElementById('kpiLowStock');
  const kpiOutOfStock = document.getElementById('kpiOutOfStock');
  const kpiTotalValuation = document.getElementById('kpiTotalValuation');
  const donutTotalCount = document.getElementById('donutTotalCount');

  if (kpiTotalStock) kpiTotalStock.textContent = totalStockUnits.toLocaleString();
  if (kpiLowStock) kpiLowStock.textContent = lowStockCount;
  if (kpiOutOfStock) kpiOutOfStock.textContent = outOfStockCount;
  if (kpiTotalValuation) kpiTotalValuation.textContent = `$${totalValuation.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
  if (donutTotalCount) donutTotalCount.textContent = totalStockUnits.toLocaleString();

  // Dynamic Notification Badges Calculation (Member 4 Intelligence)
  const notifBadgeCount = document.getElementById('notifBadgeCount');
  if (notifBadgeCount) {
    notifBadgeCount.textContent = lowStockCount + outOfStockCount + 1;
  }

  // Render recent operations table in dashboard
  const recentTbody = document.getElementById('dashboardRecentTableBody');
  if (recentTbody) {
    recentTbody.innerHTML = state.history.slice(0, 5).map(h => `
      <tr>
        <td class="font-mono font-bold">${h.ref}</td>
        <td><span class="badge ${getBadgeClassForType(h.type)}">${h.type}</span></td>
        <td><strong>${h.product}</strong> <br><small class="text-muted font-mono">${h.sku}</small></td>
        <td>${h.path}</td>
        <td class="font-bold ${h.delta.startsWith('+') ? 'text-emerald' : 'text-danger'}">${h.delta}</td>
        <td>${h.timestamp}</td>
        <td><span class="status-pill-green">Verified</span></td>
        <td><button class="btn btn-xs btn-outline" onclick="navigateTo('history')">Inspect</button></td>
      </tr>
    `).join('');
  }
}

function getBadgeClassForType(type) {
  switch (type) {
    case 'RECEIPT': return 'badge-success';
    case 'DELIVERY': return 'badge-danger';
    case 'TRANSFER': return 'badge-primary';
    case 'ADJUSTMENT': return 'badge-warning';
    default: return 'badge-neutral';
  }
}

/* --- PRODUCTS LIST (Screen 8) --- */
function renderProducts() {
  filterProducts();
}

function filterProducts() {
  const query = (document.getElementById('productSearchInput')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('productCategoryFilter')?.value || 'ALL';
  const statusFilter = document.getElementById('productStatusFilter')?.value || 'ALL';

  let list = getScopedProducts();

  if (query) {
    list = list.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) || 
      p.barcode.includes(query)
    );
  }

  if (catFilter !== 'ALL') {
    list = list.filter(p => p.category === catFilter);
  }

  if (statusFilter !== 'ALL') {
    if (statusFilter === 'IN_STOCK') list = list.filter(p => p.stock > p.minStock);
    if (statusFilter === 'LOW_STOCK') list = list.filter(p => p.stock > 0 && p.stock <= p.minStock);
    if (statusFilter === 'OUT_OF_STOCK') list = list.filter(p => p.stock === 0);
  }

  const tbody = document.getElementById('productsTableBody');
  const countBadge = document.getElementById('productCountBadge');
  if (countBadge) countBadge.textContent = `Showing ${list.length} Products`;

  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding: 30px;">No matching product inventory records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => {
    let statusBadge = '<span class="status-pill-green">In Stock</span>';
    if (p.stock === 0) {
      statusBadge = '<span class="status-pill-red">Out of Stock</span>';
    } else if (p.stock <= p.minStock) {
      statusBadge = '<span class="status-pill-amber">Low Stock Alert</span>';
    }

    const whObj = state.warehouses.find(w => w.id === p.warehouse);
    const whName = whObj ? whObj.name : p.warehouse;

    return `
      <tr>
        <td><input type="checkbox" class="prod-checkbox" value="${p.id}"></td>
        <td>
          <div class="flex-align-center gap-2">
            <div>
              <strong class="clickable-title" onclick="openProductDetail('${p.id}')">${p.name}</strong>
              <div class="text-muted text-xs font-mono">SKU: ${p.sku} | Barcode: ${p.barcode}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-neutral">${p.category}</span></td>
        <td>${whName} <br><small class="text-muted font-mono">Bin: ${p.bin}</small></td>
        <td>
          <strong class="font-mono text-main">${p.stock} units</strong>
          <div class="text-xs text-muted">Min: ${p.minStock}</div>
        </td>
        <td class="font-mono">$${p.price.toFixed(2)}</td>
        <td class="font-mono font-bold">$${(p.stock * p.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
        <td>${statusBadge}</td>
        <td class="text-right">
          <div class="flex-gap-2" style="justify-content: flex-end;">
            <button class="btn btn-xs btn-outline" onclick="openProductDetail('${p.id}')" title="View Profile">Inspect</button>
            <button class="btn btn-xs btn-outline" onclick="editProduct('${p.id}')" title="Edit">Edit</button>
            <button class="btn btn-xs btn-ghost text-red" onclick="deleteProduct('${p.id}')" title="Delete">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getScopedProducts() {
  if (state.currentWarehouse === 'ALL') {
    return state.products;
  }
  return state.products.filter(p => p.warehouse === state.currentWarehouse);
}

/* --- WAREHOUSES & LOCATIONS (Screen 12) --- */
function renderWarehouses() {
  const grid = document.getElementById('warehousesGrid');
  if (grid) {
    grid.innerHTML = state.warehouses.map(w => `
      <div class="warehouse-card">
        <div class="warehouse-header">
          <div>
            <div class="warehouse-name">${w.name}</div>
            <div class="warehouse-code">${w.code}</div>
          </div>
          <span class="badge badge-primary">${w.capacity}% Cap</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${w.capacity}%; background-color: ${w.capacity > 80 ? '#ef4444' : '#2563eb'};"></div>
        </div>
        <div class="warehouse-stat-row">
          <span>Active SKUs Stored:</span>
          <strong>${state.products.filter(p => p.warehouse === w.id).length} SKUs</strong>
        </div>
        <div class="warehouse-stat-row">
          <span>Facility Manager:</span>
          <strong>${w.manager}</strong>
        </div>
        <div class="warehouse-stat-row">
          <span>Location:</span>
          <span class="text-xs">${w.location}</span>
        </div>
      </div>
    `).join('');
  }

  const tableBody = document.getElementById('warehouseLocationsTableBody');
  if (tableBody) {
    tableBody.innerHTML = state.warehouses.map(w => `
      <tr>
        <td class="font-mono font-bold">${w.zone}</td>
        <td><strong>${w.name}</strong> <br><small class="text-muted">${w.location}</small></td>
        <td>${state.products.filter(p => p.warehouse === w.id).length} Products</td>
        <td>
          <div class="flex-align-center gap-2">
            <span>${w.capacity}%</span>
            <div class="progress-bar-bg" style="width: 100px;">
              <div class="progress-bar-fill" style="width: ${w.capacity}%;"></div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-success">Operational</span></td>
        <td>${w.manager}</td>
        <td class="text-right">
          <button class="btn btn-xs btn-outline" onclick="handleWarehouseChange('${w.id}'); navigateTo('products');">View SKUs</button>
        </td>
      </tr>
    `).join('');
  }
}

/* --- RECEIPTS (Screen 13) --- */
function renderReceipts() {
  const tbody = document.getElementById('receiptsTableBody');
  if (!tbody) return;

  const query = (document.getElementById('receiptSearchInput')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('receiptStatusFilter')?.value || 'ALL';

  let list = state.receipts;
  if (query) {
    list = list.filter(r => r.id.toLowerCase().includes(query) || r.supplier.toLowerCase().includes(query));
  }
  if (statusFilter !== 'ALL') {
    list = list.filter(r => r.status === statusFilter);
  }

  const badge = document.getElementById('receiptsCountBadge');
  if (badge) badge.textContent = `${list.length} Receipts`;

  tbody.innerHTML = list.map(r => `
    <tr>
      <td class="font-mono font-bold text-blue">${r.id}</td>
      <td><strong>${r.supplier}</strong></td>
      <td>${r.warehouse}</td>
      <td>${r.date}</td>
      <td class="font-mono">${r.itemsCount} units</td>
      <td class="font-mono font-bold">$${r.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
      <td><span class="badge ${r.status === 'Done' ? 'badge-success' : (r.status === 'Ready' ? 'badge-primary' : 'badge-neutral')}">${r.status}</span></td>
      <td class="text-right">
        ${r.status !== 'Done' ? `<button class="btn btn-xs btn-primary" onclick="validateReceiptDirect('${r.id}')">Receive Now</button>` : `<span class="text-xs text-muted">Archived</span>`}
      </td>
    </tr>
  `).join('');
}

/* --- DELIVERIES (Screen 16) --- */
function renderDeliveries() {
  const tbody = document.getElementById('deliveriesTableBody');
  if (!tbody) return;

  const query = (document.getElementById('deliverySearchInput')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('deliveryStatusFilter')?.value || 'ALL';

  let list = state.deliveries;
  if (query) {
    list = list.filter(d => d.id.toLowerCase().includes(query) || d.customer.toLowerCase().includes(query));
  }
  if (statusFilter !== 'ALL') {
    list = list.filter(d => d.status === statusFilter);
  }

  const badge = document.getElementById('deliveriesCountBadge');
  if (badge) badge.textContent = `${list.length} Orders`;

  tbody.innerHTML = list.map(d => `
    <tr>
      <td class="font-mono font-bold text-blue">${d.id}</td>
      <td><strong>${d.customer}</strong></td>
      <td>${d.warehouse}</td>
      <td>${d.date}</td>
      <td>${d.itemsDispatched}</td>
      <td><span class="badge ${d.status === 'Done' ? 'badge-success' : (d.status === 'Packing' ? 'badge-warning' : 'badge-neutral')}">${d.status}</span></td>
      <td class="text-right">
        ${d.status !== 'Done' ? `<button class="btn btn-xs btn-primary" onclick="validateDeliveryDirect('${d.id}')">Ship & Fulfill</button>` : `<span class="text-xs text-muted">Fulfilled</span>`}
      </td>
    </tr>
  `).join('');
}

/* --- TRANSFERS (Screen 18) --- */
function renderTransfers() {
  const tbody = document.getElementById('transfersTableBody');
  if (!tbody) return;

  const query = (document.getElementById('transferSearchInput')?.value || '').toLowerCase();
  let list = state.transfers;
  if (query) {
    list = list.filter(t => t.id.toLowerCase().includes(query) || t.product.toLowerCase().includes(query));
  }

  tbody.innerHTML = list.map(t => `
    <tr>
      <td class="font-mono font-bold text-blue">${t.id}</td>
      <td><span class="badge badge-neutral">${t.source}</span></td>
      <td><span class="badge badge-primary">${t.dest}</span></td>
      <td><strong>${t.product}</strong> (${t.qty} units)</td>
      <td>${t.date}</td>
      <td><span class="badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
      <td class="text-right">
        ${t.status !== 'Completed' ? `<button class="btn btn-xs btn-primary" onclick="completeTransferDirect('${t.id}')">Receive at Dest</button>` : `<span class="text-xs text-muted">Completed</span>`}
      </td>
    </tr>
  `).join('');
}

/* --- ADJUSTMENTS (Screen 21) --- */
function renderAdjustments() {
  const tbody = document.getElementById('adjustmentsTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.adjustments.map(a => `
    <tr>
      <td class="font-mono font-bold">${a.id}</td>
      <td><strong>${a.product}</strong></td>
      <td>${a.warehouse}</td>
      <td class="font-mono">${a.systemStock}</td>
      <td class="font-mono font-bold">${a.realStock}</td>
      <td class="font-mono font-bold ${a.delta < 0 ? 'text-danger' : 'text-emerald'}">${a.delta > 0 ? '+' + a.delta : a.delta}</td>
      <td><span class="badge badge-neutral">${a.reason}</span></td>
      <td>${a.auditor}</td>
      <td class="text-xs text-muted">${a.date}</td>
    </tr>
  `).join('');
}

/* --- STOCK HISTORY / AUDIT LEDGER (Screen 22) --- */
function renderHistory() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;

  const query = (document.getElementById('historySearchInput')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('historyTypeFilter')?.value || 'ALL';

  let list = state.history;
  if (query) {
    list = list.filter(h => 
      h.product.toLowerCase().includes(query) || 
      h.ref.toLowerCase().includes(query) || 
      h.user.toLowerCase().includes(query)
    );
  }
  if (typeFilter !== 'ALL') {
    list = list.filter(h => h.type === typeFilter);
  }

  const badge = document.getElementById('historyCountBadge');
  if (badge) badge.textContent = `${list.length} Log Entries`;

  tbody.innerHTML = list.map(h => `
    <tr>
      <td class="font-mono text-xs">${h.timestamp}</td>
      <td><span class="badge ${getBadgeClassForType(h.type)}">${h.type}</span></td>
      <td class="font-mono font-bold">${h.ref}</td>
      <td><strong>${h.product}</strong> <br><small class="text-muted font-mono">${h.sku}</small></td>
      <td>${h.path}</td>
      <td class="font-mono font-bold ${h.delta.startsWith('+') ? 'text-emerald' : 'text-danger'}">${h.delta}</td>
      <td class="font-mono font-bold">${h.balance}</td>
      <td>${h.user}</td>
    </tr>
  `).join('');
}

/* --- CATEGORY MANAGER (Screen 11) --- */
function renderCategoryManager() {
  const listEl = document.getElementById('categoryManagerList');
  if (!listEl) return;

  listEl.innerHTML = state.categories.map(c => `
    <div class="user-access-item flex-between" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 6px;">
      <div>
        <strong>${c.name}</strong>
        <div class="text-xs text-muted">${state.products.filter(p => p.category === c.name).length} SKUs Assigned</div>
      </div>
      <button class="btn btn-xs btn-ghost text-red" onclick="deleteCategory('${c.id}')">✕</button>
    </div>
  `).join('');
}

// ============================================================================
// 5. MODAL WORKFLOWS & ACTIONS
// ============================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');

    // Pre-fill setup for specific modals
    if (modalId === 'addProductModal') {
      document.getElementById('productModalTitle').textContent = 'Add New Product SKU';
      document.getElementById('editProductId').value = '';
      document.getElementById('productForm').reset();
      generateRandomSKU();
    } else if (modalId === 'newReceiptModal') {
      document.getElementById('recCode').value = `REC-2026-00${state.receipts.length + 1}`;
      document.getElementById('recDate').value = new Date().toISOString().split('T')[0];
      initReceiptLineItems();
    } else if (modalId === 'newDeliveryModal') {
      document.getElementById('delCode').value = `DEL-2026-0${state.deliveries.length + 90}`;
      document.getElementById('delDate').value = new Date().toISOString().split('T')[0];
      initDeliveryLineItems();
    } else if (modalId === 'newTransferModal') {
      updateTransferProductList();
    } else if (modalId === 'newAdjustmentModal') {
      updateAdjustmentProductList();
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openReorderModal(skuOrProdId) {
  const p = state.products.find(item => item.id === skuOrProdId || item.sku === skuOrProdId);
  openModal('newReceiptModal');
  if (p) {
    document.getElementById('recSupplier').value = 'Rapid Replenishment Vendor';
    const container = document.getElementById('receiptLineItemsContainer');
    container.innerHTML = `
      <div class="line-item-row">
        <select class="rec-item-prod" required>
          <option value="${p.id}" selected>${p.name} (${p.sku})</option>
        </select>
        <input type="number" class="rec-item-qty" min="1" value="${p.minStock * 2}" placeholder="Qty" required>
        <input type="number" class="rec-item-cost" min="0" step="0.01" value="${p.cost}" placeholder="Cost ($)" required>
        <button type="button" class="btn btn-xs btn-ghost text-red" onclick="this.parentElement.remove()">✕</button>
      </div>
    `;
    showToast(`Pre-filled reorder for ${p.name}`);
  }
}

// Product Management
function generateRandomSKU() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const skuInput = document.getElementById('pSku');
  if (skuInput) skuInput.value = `PRD-${rand}`;
}

function saveProduct(event) {
  event.preventDefault();
  const editId = document.getElementById('editProductId').value;
  const name = document.getElementById('pName').value.trim();
  const sku = document.getElementById('pSku').value.trim();
  const category = document.getElementById('pCategory').value;
  const warehouse = document.getElementById('pWarehouse').value;
  const stock = parseInt(document.getElementById('pStock').value, 10);
  const minStock = parseInt(document.getElementById('pMinStock').value, 10);
  const price = parseFloat(document.getElementById('pPrice').value);
  const cost = parseFloat(document.getElementById('pCost').value);
  const desc = document.getElementById('pDesc').value.trim();

  if (editId) {
    // Edit mode
    const p = state.products.find(item => item.id === editId);
    if (p) {
      p.name = name;
      p.sku = sku;
      p.category = category;
      p.warehouse = warehouse;
      p.stock = stock;
      p.minStock = minStock;
      p.price = price;
      p.cost = cost;
      p.description = desc;
      showToast(`Product ${name} updated successfully!`);

      // Backend sync
      apiClient.request(`/products/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, sku, category, warehouse, stock, minStock, price, cost, description: desc })
      });
    }
  } else {
    // Create new
    const newId = `PRD-${Date.now().toString().slice(-6)}`;
    const newProduct = {
      id: newId,
      name,
      sku,
      category,
      warehouse,
      bin: 'A-01-01',
      stock,
      minStock,
      price,
      cost,
      barcode: `890${Date.now().toString().slice(-9)}`,
      status: stock > minStock ? 'IN_STOCK' : (stock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK'),
      description: desc
    };
    state.products.unshift(newProduct);
    
    // Add ledger log
    state.history.unshift({
      timestamp: formatNow(),
      type: 'ADJUSTMENT',
      ref: `NEW-SKU-${sku}`,
      product: name,
      sku: sku,
      path: `Initial Stock Registry → ${warehouse}`,
      delta: `+${stock} units`,
      balance: `${stock} units`,
      user: 'Tarun'
    });

    showToast(`New SKU ${sku} activated successfully!`);

    // Backend sync
    apiClient.request('/products', {
      method: 'POST',
      body: JSON.stringify(newProduct)
    });
  }

  state.saveState();
  closeModal('addProductModal');
  renderAllViews();
}

function editProduct(productId) {
  const p = state.products.find(item => item.id === productId);
  if (!p) return;

  openModal('addProductModal');
  document.getElementById('productModalTitle').textContent = `Edit Product: ${p.name}`;
  document.getElementById('editProductId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pSku').value = p.sku;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pWarehouse').value = p.warehouse;
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pMinStock').value = p.minStock;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pCost').value = p.cost;
  document.getElementById('pDesc').value = p.description || '';
}

function deleteProduct(productId) {
  if (confirm('Are you sure you want to remove this SKU record from inventory?')) {
    state.products = state.products.filter(p => p.id !== productId);
    state.saveState();
    renderAllViews();
    showToast('Product removed.');

    // Backend sync
    apiClient.request(`/products/${productId}`, {
      method: 'DELETE'
    });
  }
}

function openProductDetail(productId) {
  const p = state.products.find(item => item.id === productId);
  if (!p) return;

  document.getElementById('detailProductName').textContent = p.name;
  document.getElementById('detailProductSku').textContent = `SKU: ${p.sku}`;
  document.getElementById('detailStockQty').textContent = `${p.stock} units`;
  document.getElementById('detailMinStock').textContent = `${p.minStock} units`;
  document.getElementById('detailUnitPrice').textContent = `$${p.price.toFixed(2)}`;
  document.getElementById('detailTotalValuation').textContent = `$${(p.stock * p.price).toLocaleString()}`;
  document.getElementById('detailCategory').textContent = p.category;
  document.getElementById('detailWarehouse').textContent = p.warehouse;
  document.getElementById('detailBarcode').textContent = `EAN-13: ${p.barcode}`;

  const badge = document.getElementById('detailProductStatusBadge');
  if (p.stock === 0) {
    badge.className = 'badge badge-danger';
    badge.textContent = 'Out of Stock';
  } else if (p.stock <= p.minStock) {
    badge.className = 'badge badge-warning';
    badge.textContent = 'Low Stock Alert';
  } else {
    badge.className = 'badge badge-success';
    badge.textContent = 'In Stock';
  }

  // Populate recent movement for this product
  const movements = state.history.filter(h => h.sku === p.sku || h.product === p.name);
  const tbody = document.getElementById('detailMovementHistoryBody');
  if (movements.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No historical transactions logged for this SKU.</td></tr>`;
  } else {
    tbody.innerHTML = movements.slice(0, 4).map(m => `
      <tr>
        <td>${m.timestamp}</td>
        <td><span class="badge ${getBadgeClassForType(m.type)}">${m.type}</span></td>
        <td class="font-mono">${m.ref}</td>
        <td class="font-mono font-bold ${m.delta.startsWith('+') ? 'text-emerald' : 'text-danger'}">${m.delta}</td>
        <td class="font-mono">${m.balance}</td>
      </tr>
    `).join('');
  }

  openModal('productDetailModal');
}

// Inbound Receipts Engine
function initReceiptLineItems() {
  const container = document.getElementById('receiptLineItemsContainer');
  container.innerHTML = `
    <div class="line-item-row">
      <select class="rec-item-prod" required>
        ${state.products.map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('')}
      </select>
      <input type="number" class="rec-item-qty" min="1" value="50" placeholder="Qty" required>
      <input type="number" class="rec-item-cost" min="0" step="0.01" value="150.00" placeholder="Cost ($)" required>
      <button type="button" class="btn btn-xs btn-ghost text-red" onclick="this.parentElement.remove()">✕</button>
    </div>
  `;
}

function addReceiptLineItem() {
  const container = document.getElementById('receiptLineItemsContainer');
  const div = document.createElement('div');
  div.className = 'line-item-row';
  div.innerHTML = `
    <select class="rec-item-prod" required>
      ${state.products.map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('')}
    </select>
    <input type="number" class="rec-item-qty" min="1" value="25" placeholder="Qty" required>
    <input type="number" class="rec-item-cost" min="0" step="0.01" value="80.00" placeholder="Cost ($)" required>
    <button type="button" class="btn btn-xs btn-ghost text-red" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(div);
}

function createReceipt(event, forcedStatus = null) {
  if (event) event.preventDefault();
  const supplier = document.getElementById('recSupplier').value.trim();
  const recCode = document.getElementById('recCode').value;
  const warehouse = document.getElementById('recWarehouse').value;
  const date = document.getElementById('recDate').value;

  const rows = document.querySelectorAll('#receiptLineItemsContainer .line-item-row');
  if (rows.length === 0) {
    alert('Please add at least one line item.');
    return;
  }

  let items = [];
  let totalQty = 0;
  let totalVal = 0;

  rows.forEach(row => {
    const prodId = row.querySelector('.rec-item-prod').value;
    const qty = parseInt(row.querySelector('.rec-item-qty').value, 10);
    const cost = parseFloat(row.querySelector('.rec-item-cost').value);
    const prod = state.products.find(p => p.id === prodId);

    items.push({ productId: prodId, name: prod ? prod.name : 'Unknown', qty, cost });
    totalQty += qty;
    totalVal += (qty * cost);

    // If validated directly, increment stock in warehouse!
    if (forcedStatus !== 'Draft') {
      if (prod) {
        prod.stock += qty;
        state.history.unshift({
          timestamp: formatNow(),
          type: 'RECEIPT',
          ref: recCode,
          product: prod.name,
          sku: prod.sku,
          path: `${supplier} → ${warehouse}`,
          delta: `+${qty} units`,
          balance: `${prod.stock} units`,
          user: 'Ameer Pasha'
        });
      }
    }
  });

  const receipt = {
    id: recCode,
    supplier,
    warehouse,
    date,
    itemsCount: totalQty,
    totalValue: totalVal,
    status: forcedStatus === 'Draft' ? 'Draft' : 'Done',
    items
  };

  state.receipts.unshift(receipt);
  state.saveState();
  closeModal('newReceiptModal');
  renderAllViews();
  showToast(forcedStatus === 'Draft' ? 'Receipt saved as Draft.' : `Stock received and ${totalQty} units added to ${warehouse}!`);

  // Backend sync
  apiClient.request('/receipts', {
    method: 'POST',
    body: JSON.stringify(receipt)
  });
}

async function validateReceiptDirect(receiptId) {
  const rec = state.receipts.find(r => r.id === receiptId);
  if (!rec) return;

  const res = await apiClient.request(`/receipts/${receiptId}/validate`, {
    method: 'PUT'
  });

  if (res && res.error) {
    showToast(`Receipt validation failed: ${res.error}`, 'danger');
    return;
  }

  rec.items.forEach(item => {
    const prod = state.products.find(p => p.id === item.productId);
    if (prod && rec.status !== 'Done') {
      prod.stock += (item.qty || 1);
      state.history.unshift({
        timestamp: formatNow(),
        type: 'RECEIPT',
        ref: rec.id,
        product: prod.name,
        sku: prod.sku,
        path: `${rec.supplier} → ${rec.warehouse}`,
        delta: `+${item.qty || 1} units`,
        balance: `${prod.stock} units`,
        user: 'Ameer Pasha'
      });
    }
  });

  rec.status = 'Done';
  state.saveState();
  renderAllViews();
  showToast(`Receipt ${receiptId} validated. Stock updated!`, 'success');
}

// Outbound Delivery Orders Engine
function initDeliveryLineItems() {
  const container = document.getElementById('deliveryLineItemsContainer');
  const availableProds = getScopedProducts();
  container.innerHTML = `
    <div class="line-item-row">
      <select class="del-item-prod" required>
        ${availableProds.map(p => `<option value="${p.id}">${p.name} (Available: ${p.stock})</option>`).join('')}
      </select>
      <input type="number" class="del-item-qty" min="1" value="5" placeholder="Ship Qty" required>
      <span></span>
      <button type="button" class="btn btn-xs btn-ghost text-red" onclick="this.parentElement.remove()">✕</button>
    </div>
  `;
}

function addDeliveryLineItem() {
  const container = document.getElementById('deliveryLineItemsContainer');
  const availableProds = getScopedProducts();
  const div = document.createElement('div');
  div.className = 'line-item-row';
  div.innerHTML = `
    <select class="del-item-prod" required>
      ${availableProds.map(p => `<option value="${p.id}">${p.name} (Available: ${p.stock})</option>`).join('')}
    </select>
    <input type="number" class="del-item-qty" min="1" value="5" placeholder="Ship Qty" required>
    <span></span>
    <button type="button" class="btn btn-xs btn-ghost text-red" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(div);
}

async function createDelivery(event) {
  event.preventDefault();
  const customer = document.getElementById('delCustomer').value.trim();
  const delCode = document.getElementById('delCode').value;
  const warehouse = document.getElementById('delWarehouse').value;
  const date = document.getElementById('delDate').value;

  const rows = document.querySelectorAll('#deliveryLineItemsContainer .line-item-row');
  let items = [];
  let summaryParts = [];

  for (let row of rows) {
    const prodId = row.querySelector('.del-item-prod').value;
    const qty = parseInt(row.querySelector('.del-item-qty').value, 10);
    const prod = state.products.find(p => p.id === prodId);

    if (prod) {
      if (prod.stock < qty) {
        showToast(`Shortage: "${prod.name}" has only ${prod.stock} units available (Demanded: ${qty})!`, 'danger');
        return;
      }
      items.push({ productId: prodId, qty });
      summaryParts.push(`${qty} x ${prod.name}`);
    }
  }

  const delivery = {
    id: delCode,
    customer,
    warehouse,
    date,
    itemsDispatched: summaryParts.join(', '),
    status: 'Done',
    items
  };

  // Sync with backend first to enforce Shortage Prevention Gate
  const res = await apiClient.request('/deliveries', {
    method: 'POST',
    body: JSON.stringify(delivery)
  });

  if (res && res.error) {
    showToast(`Delivery blocked: ${res.error}`, 'danger');
    return;
  }

  // Deduct stock locally
  for (let item of items) {
    const prod = state.products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.qty);
      state.history.unshift({
        timestamp: formatNow(),
        type: 'DELIVERY',
        ref: delCode,
        product: prod.name,
        sku: prod.sku,
        path: `${warehouse} → ${customer}`,
        delta: `-${item.qty} units`,
        balance: `${prod.stock} units`,
        user: 'Ameer Pasha'
      });
    }
  }

  state.deliveries.unshift(delivery);
  state.saveState();
  closeModal('newDeliveryModal');
  renderAllViews();
  showToast(`Delivery Order ${delCode} shipped to ${customer}!`, 'success');
}

async function validateDeliveryDirect(delId) {
  const d = state.deliveries.find(item => item.id === delId);
  if (!d) return;

  const res = await apiClient.request(`/deliveries/${delId}/validate`, {
    method: 'PUT'
  });

  if (res && res.error) {
    showToast(`Delivery failed: ${res.error}`, 'danger');
    return;
  }

  if (d.items && d.status !== 'Done') {
    d.items.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - (item.qty || 1));
      }
    });
  }

  d.status = 'Done';
  state.saveState();
  renderAllViews();
  showToast(`Order ${delId} marked as shipped!`, 'success');
}

// Internal Warehouse Transfers Engine
function updateTransferProductList() {
  const sourceWh = document.getElementById('trfSource').value;
  const prodSelect = document.getElementById('trfProduct');
  const prods = state.products.filter(p => p.warehouse === sourceWh);

  if (prods.length === 0) {
    prodSelect.innerHTML = `<option value="">No items stored in ${sourceWh}</option>`;
  } else {
    prodSelect.innerHTML = prods.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('');
  }
  updateTransferAvailableStock();
}

function updateTransferAvailableStock() {
  const prodId = document.getElementById('trfProduct').value;
  const prod = state.products.find(p => p.id === prodId);
  const hint = document.getElementById('trfAvailableStockHint');
  if (prod && hint) {
    hint.textContent = `Available in Origin: ${prod.stock} units`;
  }
}

function createTransfer(event) {
  event.preventDefault();
  const source = document.getElementById('trfSource').value;
  const dest = document.getElementById('trfDest').value;
  const prodId = document.getElementById('trfProduct').value;
  const qty = parseInt(document.getElementById('trfQty').value, 10);
  const reason = document.getElementById('trfReason').value.trim() || 'Internal Rebalance';

  if (source === dest) {
    alert('Origin and Destination warehouse cannot be the same!');
    return;
  }

  const prod = state.products.find(p => p.id === prodId);
  if (!prod || prod.stock < qty) {
    alert('Insufficient stock at source warehouse to transfer!');
    return;
  }

  // Deduct from source
  prod.stock -= qty;

  const trfId = `TRF-2026-0${state.transfers.length + 44}`;
  const transfer = {
    id: trfId,
    source,
    dest,
    product: prod.name,
    productId: prod.id,
    qty,
    date: new Date().toISOString().split('T')[0],
    status: 'In-Transit',
    reason
  };

  state.transfers.unshift(transfer);

  state.history.unshift({
    timestamp: formatNow(),
    type: 'TRANSFER',
    ref: trfId,
    product: prod.name,
    sku: prod.sku,
    path: `${source} → ${dest}`,
    delta: `-${qty} (in-transit)`,
    balance: `${prod.stock} units`,
    user: 'Ameer Pasha'
  });

  state.saveState();
  closeModal('newTransferModal');
  renderAllViews();
  showToast(`Transfer ${trfId} dispatched from ${source} to ${dest}!`);

  // Backend sync
  apiClient.request('/transfers', {
    method: 'POST',
    body: JSON.stringify(transfer)
  });
}

async function completeTransferDirect(trfId) {
  const t = state.transfers.find(item => item.id === trfId);
  if (!t) return;

  const res = await apiClient.request(`/transfers/${trfId}/complete`, {
    method: 'PUT'
  });

  if (res && res.error) {
    showToast(`Transfer failed: ${res.error}`, 'danger');
    return;
  }

  const prod = state.products.find(p => p.id === t.productId);
  if (prod && t.status !== 'Completed') {
    prod.stock += t.qty;
    t.status = 'Completed';

    state.history.unshift({
      timestamp: formatNow(),
      type: 'TRANSFER',
      ref: t.id,
      product: t.product,
      sku: prod.sku,
      path: `Received at ${t.dest}`,
      delta: `+${t.qty} units`,
      balance: `${prod.stock} units`,
      user: 'Ameer Pasha'
    });

    state.saveState();
    renderAllViews();
    showToast(`Transfer ${trfId} received at ${t.dest}!`, 'success');
  }
}

// Physical Inventory Adjustments Engine
function updateAdjustmentProductList() {
  const wh = document.getElementById('adjWarehouse').value;
  const select = document.getElementById('adjProduct');
  const prods = state.products.filter(p => p.warehouse === wh);

  select.innerHTML = prods.map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('');
  handleAdjustmentProductSelect();
}

function handleAdjustmentProductSelect() {
  const prodId = document.getElementById('adjProduct').value;
  const prod = state.products.find(p => p.id === prodId);
  if (prod) {
    document.getElementById('adjSystemQty').value = prod.stock;
    document.getElementById('adjRealQty').value = prod.stock;
    calculateAdjustmentDelta();
  }
}

function calculateAdjustmentDelta() {
  const sys = parseInt(document.getElementById('adjSystemQty').value || 0, 10);
  const real = parseInt(document.getElementById('adjRealQty').value || 0, 10);
  const delta = real - sys;
  const display = document.getElementById('adjDeltaDisplay');

  if (delta > 0) {
    display.innerHTML = `Discrepancy: <span class="font-bold text-emerald">+${delta} units (Excess Found)</span>`;
  } else if (delta < 0) {
    display.innerHTML = `Discrepancy: <span class="font-bold text-danger">${delta} units (Shortage / Loss)</span>`;
  } else {
    display.innerHTML = `Discrepancy: <span class="font-bold text-muted">0 units (Count Matches)</span>`;
  }
}

function createAdjustment(event) {
  event.preventDefault();
  const wh = document.getElementById('adjWarehouse').value;
  const prodId = document.getElementById('adjProduct').value;
  const realStock = parseInt(document.getElementById('adjRealQty').value, 10);
  const reason = document.getElementById('adjReason').value;

  const prod = state.products.find(p => p.id === prodId);
  if (!prod) return;

  const prevStock = prod.stock;
  const delta = realStock - prevStock;
  prod.stock = realStock;

  const adjId = `ADJ-2026-0${state.adjustments.length + 13}`;
  const adjustment = {
    id: adjId,
    product: prod.name,
    productId: prod.id,
    warehouse: wh,
    systemStock: prevStock,
    realStock: realStock,
    delta: delta,
    reason: reason,
    auditor: 'Tarun (Auditor)',
    date: formatNow()
  };

  state.adjustments.unshift(adjustment);

  state.history.unshift({
    timestamp: formatNow(),
    type: 'ADJUSTMENT',
    ref: adjId,
    product: prod.name,
    sku: prod.sku,
    path: `${wh} (Cycle Audit)`,
    delta: `${delta > 0 ? '+' + delta : delta} units`,
    balance: `${realStock} units`,
    user: 'Tarun (Auditor)'
  });

  state.saveState();
  closeModal('newAdjustmentModal');
  renderAllViews();
  showToast(`Adjustment ${adjId} recorded and stock reconciled!`);

  // Backend sync
  apiClient.request('/adjustments', {
    method: 'POST',
    body: JSON.stringify({
      productId: prod.id,
      realStock,
      reason,
      auditor: 'Tarun (Auditor)'
    })
  });
}

// Categories Management
function populateCategorySelects() {
  const pCatSelect = document.getElementById('pCategory');
  const filterCatSelect = document.getElementById('productCategoryFilter');

  if (pCatSelect) {
    pCatSelect.innerHTML = state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
  if (filterCatSelect) {
    filterCatSelect.innerHTML = `<option value="ALL">All Categories</option>` + 
      state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
}

function populateWarehouseFilter() {
  const select = document.getElementById('globalWarehouseFilter');
  if (select) {
    select.value = state.currentWarehouse;
  }
}

function addCategory(event) {
  event.preventDefault();
  const name = document.getElementById('catNameInput').value.trim();
  if (!name) return;

  const newCat = {
    id: `CAT-${state.categories.length + 1}`,
    name,
    count: 0,
    value: 0
  };
  state.categories.push(newCat);
  state.saveState();
  populateCategorySelects();
  renderCategoryManager();
  document.getElementById('catNameInput').value = '';
  showToast(`Category "${name}" added.`);

  // Backend sync
  apiClient.request('/categories', {
    method: 'POST',
    body: JSON.stringify(newCat)
  });
}

function deleteCategory(catId) {
  state.categories = state.categories.filter(c => c.id !== catId);
  state.saveState();
  populateCategorySelects();
  renderCategoryManager();
  showToast('Category deleted.');

  // Backend sync
  apiClient.request(`/categories/${catId}`, {
    method: 'DELETE'
  });
}

// ============================================================================
// 6. AUTHENTICATION & IDENTITY (Wireframes 1 - 6 & Dedicated Auth Center)
// ============================================================================

function updateUserProfileUI(user) {
  if (!user) return;
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const roleText = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Staff';

  // 1. Topbar Elements
  const nameEl = document.getElementById('currentUserName');
  const roleEl = document.getElementById('currentUserRole');
  const avatarEl = document.getElementById('currentUserAvatar');
  const headerEl = document.getElementById('userMenuHeader');

  if (nameEl) nameEl.textContent = user.name || 'User';
  if (roleEl) roleEl.textContent = roleText;
  if (headerEl) headerEl.textContent = `Logged in as ${user.name || 'User'}`;
  if (avatarEl) avatarEl.textContent = initials;

  // 2. Sidebar Footer Card Elements
  const sbNameEl = document.getElementById('sidebarUserName');
  const sbRoleEl = document.getElementById('sidebarUserRole');
  const sbAvatarEl = document.getElementById('sidebarUserAvatar');

  if (sbNameEl) sbNameEl.textContent = user.name || 'User';
  if (sbRoleEl) sbRoleEl.textContent = `${roleText} · Online`;
  if (sbAvatarEl) sbAvatarEl.textContent = initials;

  // 3. Dedicated Auth Page Elements
  const apNameEl = document.getElementById('authPageUserName');
  const apEmailEl = document.getElementById('authPageUserEmail');
  const apRoleEl = document.getElementById('authPageUserRole');
  const apAvatarEl = document.getElementById('authPageAvatar');
  const apBadgeEl = document.getElementById('authSessionStatusBadge');
  const apTokenEl = document.getElementById('authTokenStatus');

  if (apNameEl) apNameEl.textContent = user.name || 'User';
  if (apEmailEl) apEmailEl.textContent = user.email || 'user@stocksense.io';
  if (apRoleEl) apRoleEl.textContent = roleText;
  if (apAvatarEl) apAvatarEl.textContent = initials;
  if (apBadgeEl) {
    if (state.authToken) {
      apBadgeEl.textContent = 'Authenticated';
      apBadgeEl.className = 'badge badge-success';
    } else {
      apBadgeEl.textContent = 'Guest / Unsigned';
      apBadgeEl.className = 'badge badge-warning';
    }
  }
  if (apTokenEl) {
    apTokenEl.textContent = state.authToken ? 'Active (Bearer JWT)' : 'None (Read-Only Mode)';
    apTokenEl.className = state.authToken ? 'font-mono text-success' : 'font-mono text-muted';
  }
}

function updateAuthPageUI() {
  updateUserProfileUI(state.currentUser);
}

function switchAuthPageTab(tabName) {
  document.querySelectorAll('.auth-page-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-page-panel').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const tabBtn = document.getElementById(`authPageTab-${tabName}`);
  const panel = document.getElementById(`authPagePanel-${tabName}`);
  if (tabBtn) tabBtn.classList.add('active');
  if (panel) {
    panel.classList.add('active');
    panel.style.display = 'block';
  }
}

async function quickLogin(email, password) {
  try {
    const res = await apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res && res.success && res.data) {
      state.currentUser = res.data.user;
      state.authToken = res.data.token;
      state.saveState();
      updateUserProfileUI(res.data.user);
      showToast(res.message || `Switched to ${res.data.user.name}`, 'success');
      closeModal('authModal');
    } else {
      showToast(res?.error || 'Authentication failed', 'danger');
    }
  } catch (err) {
    showToast(err.message || 'Login request error', 'danger');
  }
}

async function handleAuthPageLogin(event) {
  event.preventDefault();
  const email = document.getElementById('authLoginEmailInput')?.value;
  const password = document.getElementById('authLoginPasswordInput')?.value;

  try {
    const res = await apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res && res.success && res.data) {
      state.currentUser = res.data.user;
      state.authToken = res.data.token;
      state.saveState();
      updateUserProfileUI(res.data.user);
      showToast(res.message || `Logged in as ${res.data.user.name}`, 'success');
    } else {
      showToast(res?.error || 'Invalid credentials. Password: password123', 'danger');
    }
  } catch (err) {
    showToast(err.message || 'Login failed', 'danger');
  }
}

async function handleAuthPageSignup(event) {
  event.preventDefault();
  const name = document.getElementById('authSignupNameInput')?.value;
  const email = document.getElementById('authSignupEmailInput')?.value;
  const password = document.getElementById('authSignupPasswordInput')?.value;

  try {
    const res = await apiClient.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    if (res && res.success && res.data) {
      state.currentUser = res.data.user;
      state.authToken = res.data.token;
      state.saveState();
      updateUserProfileUI(res.data.user);
      showToast(`Account registered for ${name}! Welcome.`, 'success');
      switchAuthPageTab('login');
    } else {
      showToast(res?.error || 'Registration failed', 'danger');
    }
  } catch (err) {
    showToast(err.message || 'Signup error', 'danger');
  }
}

async function handleAuthPageSendOtp() {
  const email = document.getElementById('authResetEmailInput')?.value;
  if (!email) {
    showToast('Please enter your work email', 'warning');
    return;
  }

  try {
    const res = await apiClient.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (res && res.success) {
      showToast(res.message || 'OTP verification code sent!', 'info');
      const otpInput = document.getElementById('authResetOtpInput');
      if (otpInput) otpInput.value = '4829';
    } else {
      showToast(res?.error || 'Could not send verification code', 'danger');
    }
  } catch (err) {
    showToast('Verification OTP code sent (Demo: 4829)', 'info');
    const otpInput = document.getElementById('authResetOtpInput');
    if (otpInput) otpInput.value = '4829';
  }
}

async function handleAuthPageReset(event) {
  event.preventDefault();
  const otp = document.getElementById('authResetOtpInput')?.value || '4829';
  const newPass = document.getElementById('authResetNewPasswordInput')?.value;

  try {
    const res = await apiClient.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ otp, password: newPass })
    });

    showToast(res?.message || 'Password updated! Please sign in.', 'success');
    switchAuthPageTab('login');
  } catch (err) {
    showToast('Password updated! Please sign in.', 'success');
    switchAuthPageTab('login');
  }
}

function handleAuthLogout() {
  state.authToken = null;
  state.currentUser = { id: 'guest-001', name: 'Guest Operator', email: 'operator@stocksense.io', role: 'guest' };
  state.saveState();
  updateUserProfileUI(state.currentUser);
  showToast('Logged out of workstation. Switched to guest mode.');
}

function openAuthModal(screenName = 'splash') {
  openModal('authModal');
  openAuthScreen(screenName);
}

function openAuthScreen(screenName) {
  document.querySelectorAll('.auth-subscreen').forEach(el => el.style.display = 'none');
  const target = document.getElementById(`authScreen-${screenName}`);
  if (target) target.style.display = 'block';
}

async function handleAuthLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  try {
    const res = await apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res && res.success && res.data) {
      state.currentUser = res.data.user;
      state.authToken = res.data.token;
      state.saveState();
      updateUserProfileUI(res.data.user);
      showToast(res.message || `Logged in as ${res.data.user.name}`, 'success');
      closeModal('authModal');
    } else {
      showToast(res?.error || 'Invalid credentials', 'danger');
    }
  } catch (err) {
    showToast(err.message || 'Login failed', 'danger');
  }
}

async function handleAuthSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName')?.value;
  const email = document.getElementById('signupEmail')?.value;
  const password = document.getElementById('signupPassword')?.value;

  try {
    const res = await apiClient.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    if (res && res.success && res.data) {
      state.currentUser = res.data.user;
      state.authToken = res.data.token;
      state.saveState();
      updateUserProfileUI(res.data.user);
      showToast('Account created! Welcome to StockSense.', 'success');
      closeModal('authModal');
    } else {
      showToast(res?.error || 'Signup failed', 'danger');
    }
  } catch (err) {
    showToast(err.message || 'Signup failed', 'danger');
  }
}

async function handleAuthForgot(event) {
  event.preventDefault();
  const email = document.getElementById('forgotEmail')?.value;

  try {
    const res = await apiClient.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (res && res.success) {
      showToast(res.message || 'Verification code sent to your email', 'info');
      openAuthScreen('otp');
    } else {
      showToast(res?.error || 'Could not send verification code', 'danger');
    }
  } catch (err) {
    openAuthScreen('otp');
  }
}

async function handleAuthVerifyOtp(event) {
  if (event) event.preventDefault();
  const otpBoxes = document.querySelectorAll('#authScreen-otp .otp-box');
  let otp = '';
  otpBoxes.forEach(b => otp += b.value);
  if (!otp) otp = '4829';

  try {
    const res = await apiClient.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp })
    });

    if (res && res.success) {
      showToast('OTP verified successfully', 'success');
      openAuthScreen('reset');
    } else {
      showToast(res?.error || 'Invalid OTP code', 'danger');
    }
  } catch (err) {
    showToast('OTP verified', 'success');
    openAuthScreen('reset');
  }
}

async function handleAuthReset(event) {
  event.preventDefault();
  const newPass = document.getElementById('resetNewPassword')?.value;
  const confPass = document.getElementById('resetConfirmPassword')?.value;

  if (newPass && confPass && newPass !== confPass) {
    showToast('Passwords do not match', 'danger');
    return;
  }

  try {
    const res = await apiClient.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password: newPass })
    });

    showToast(res?.message || 'Password updated! You can now sign in.', 'success');
    openAuthScreen('login');
  } catch (err) {
    showToast('Password updated! You can now sign in.', 'success');
    openAuthScreen('login');
  }
}
}

// ============================================================================
// 7. CHART.JS ANALYTICS ENGINE (With Offline Graceful Fallbacks)
// ============================================================================

function initCharts() {
  // If Chart.js library is not available (e.g. fully offline), render fallback canvas
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js CDN not loaded, rendering lightweight Canvas charts.');
    renderOfflineCanvasCharts();
    return;
  }

  try {
    // 1. Stock Trends & Velocity Chart (Sparkline & Multi-Line Inflow/Outflow)
    const ctxTrends = document.getElementById('stockTrendsChart')?.getContext('2d');
    if (ctxTrends) {
      stockTrendsChart = new Chart(ctxTrends, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Inbound Receipts (Units)',
              data: [120, 190, 80, 240, 160, 95, 150],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              fill: true,
              tension: 0.4,
              borderWidth: 2.5
            },
            {
              label: 'Outbound Dispatches (Units)',
              data: [80, 110, 140, 170, 120, 190, 130],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              fill: true,
              tension: 0.4,
              borderWidth: 2.5
            },
            {
              label: 'Net Balance Growth',
              data: [40, 120, 60, 130, 170, 75, 95],
              borderColor: '#2563eb',
              borderDash: [5, 5],
              tension: 0.4,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 } } },
            tooltip: { padding: 10, cornerRadius: 8 }
          },
          scales: {
            y: { grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Inventory Distribution Donut Chart
    const ctxDonut = document.getElementById('inventoryDonutChart')?.getContext('2d');
    if (ctxDonut) {
      const catLabels = state.categories.map(c => c.name);
      const catData = state.categories.map(c => {
        return state.products.filter(p => p.category === c.name).reduce((acc, p) => acc + p.stock, 0);
      });

      inventoryDonutChart = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
            borderWidth: 0,
            cutout: '72%'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });

      renderDonutLegend(catLabels, catData);
    }

    // 3. Burn Rate / Stockout Risk Chart
    const ctxBurn = document.getElementById('burnRateChart')?.getContext('2d');
    if (ctxBurn) {
      burnRateChart = new Chart(ctxBurn, {
        type: 'bar',
        data: {
          labels: ['Bearings 290', 'Inverter V3', 'Pressure Sensor', 'Rack Rails', 'Fasteners M8'],
          datasets: [
            {
              label: 'Days Until Stockout',
              data: [3.2, 18.5, 14.0, 32.0, 4.1],
              backgroundColor: ['#ef4444', '#10b981', '#2563eb', '#10b981', '#f59e0b'],
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { title: { display: true, text: 'Estimated Days of Supply' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  } catch (err) {
    console.warn('Error initializing Chart.js, using fallback:', err);
    renderOfflineCanvasCharts();
  }
}

function renderOfflineCanvasCharts() {
  // Render clean fallback bars & legend if offline
  const catLabels = state.categories.map(c => c.name);
  const catData = state.categories.map(c => {
    return state.products.filter(p => p.category === c.name).reduce((acc, p) => acc + p.stock, 0);
  });
  renderDonutLegend(catLabels, catData);
}

function renderDonutLegend(labels, data) {
  const container = document.getElementById('categoryLegendList');
  if (!container) return;
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  const total = data.reduce((a, b) => a + b, 0) || 1;

  container.innerHTML = labels.map((label, idx) => {
    const val = data[idx] || 0;
    const pct = Math.round((val / total) * 100);
    return `
      <div class="legend-item">
        <span><span class="legend-color-dot" style="background: ${colors[idx % colors.length]}"></span>${label}</span>
        <strong>${pct}% (${val} units)</strong>
      </div>
    `;
  }).join('');
}

function updateCharts() {
  if (inventoryDonutChart) {
    const catLabels = state.categories.map(c => c.name);
    const catData = state.categories.map(c => {
      return state.products.filter(p => p.category === c.name).reduce((acc, p) => acc + p.stock, 0);
    });
    inventoryDonutChart.data.labels = catLabels;
    inventoryDonutChart.data.datasets[0].data = catData;
    inventoryDonutChart.update();
    renderDonutLegend(catLabels, catData);
  }
}

function updateSparklineRange(range, btn) {
  document.querySelectorAll('.pill-toggle-group .pill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (stockTrendsChart) {
    if (range === '7d') {
      stockTrendsChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      stockTrendsChart.data.datasets[0].data = [120, 190, 80, 240, 160, 95, 150];
      stockTrendsChart.data.datasets[1].data = [80, 110, 140, 170, 120, 190, 130];
    } else if (range === '30d') {
      stockTrendsChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      stockTrendsChart.data.datasets[0].data = [840, 1120, 930, 1450];
      stockTrendsChart.data.datasets[1].data = [720, 890, 1050, 1200];
    } else {
      stockTrendsChart.data.labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      stockTrendsChart.data.datasets[0].data = [3400, 4800, 5200, 6100];
      stockTrendsChart.data.datasets[1].data = [2900, 4100, 4900, 5700];
    }
    stockTrendsChart.update();
  }
}

// ============================================================================
// 8. GLOBAL COMMAND PALETTE (Ctrl + K) & NOTIFICATIONS
// ============================================================================

function openCommandPalette() {
  openModal('commandPaletteModal');
  const input = document.getElementById('cmdInput');
  input.value = '';
  handleCommandSearch('');
  setTimeout(() => input.focus(), 50);
}

function handleCommandSearch(query) {
  const container = document.getElementById('cmdResultsList');
  const q = query.toLowerCase().trim();

  const commands = [
    { title: 'Navigate: Products Catalog', desc: 'Browse all active SKUs and stock balances', action: () => navigateTo('products') },
    { title: 'Action: Add New Product', desc: 'Register a new SKU with barcode and pricing', action: () => openModal('addProductModal') },
    { title: 'Action: New Inbound Receipt', desc: 'Process purchase shipments from vendors', action: () => openModal('newReceiptModal') },
    { title: 'Action: New Outbound Delivery', desc: 'Pick, pack and dispatch customer orders', action: () => openModal('newDeliveryModal') },
    { title: 'Action: Internal Stock Transfer', desc: 'Move inventory between warehouses', action: () => openModal('newTransferModal') },
    { title: 'Action: Record Physical Count', desc: 'Adjust stock discrepancies and cycle audits', action: () => openModal('newAdjustmentModal') },
    { title: 'Navigate: Audit History Ledger', desc: 'Inspect chronological ledger log entries', action: () => navigateTo('history') },
    { title: 'Navigate: Insights & AI Intelligence', desc: 'ABC analysis and stockout risk forecast', action: () => navigateTo('insights') }
  ];

  // Add matching products
  state.products.forEach(p => {
    commands.push({
      title: `Product: ${p.name}`,
      desc: `SKU: ${p.sku} | Stock: ${p.stock} units in ${p.warehouse}`,
      action: () => openProductDetail(p.id)
    });
  });

  const matches = commands.filter(c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));

  container.innerHTML = matches.map((m, idx) => `
    <div class="command-result-item" onclick="executeCommand(${idx})">
      <div>
        <strong>${m.title}</strong>
        <div class="text-xs text-muted">${m.desc}</div>
      </div>
      <kbd class="kbd-badge">↵</kbd>
    </div>
  `).join('');

  window._cmdMatches = matches;
}

function executeCommand(idx) {
  if (window._cmdMatches && window._cmdMatches[idx]) {
    closeModal('commandPaletteModal');
    window._cmdMatches[idx].action();
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
  });
}

function renderNotifications() {
  const container = document.getElementById('notifListContainer');
  if (!container) return;

  container.innerHTML = state.notifications.map(n => `
    <div class="user-access-item" style="padding: 8px 12px; border-bottom: 1px solid var(--border);">
      <div class="flex-between">
        <strong class="text-xs ${n.type === 'danger' ? 'text-red' : 'text-amber'}">${n.title}</strong>
        <span class="text-xs text-muted">${n.time}</span>
      </div>
      <p class="text-xs text-muted mt-1">${n.desc}</p>
    </div>
  `).join('');
}

// ============================================================================
// 9. THEME & UTILITIES
// ============================================================================

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.theme);
  state.saveState();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleDropdown(id) {
  const el = document.getElementById(id);
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('active'));
  if (!wasActive) el.classList.add('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const isDanger = type === 'danger';
  const isSuccess = type === 'success';
  toast.className = `toast ${isDanger ? 'toast-danger' : (isSuccess ? 'toast-success' : '')}`;
  const iconColor = isDanger ? 'text-red' : (isSuccess ? 'text-emerald' : 'text-blue');
  const iconSvg = isDanger
    ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
    : '<polyline points="20 6 9 17 4 12"></polyline>';
  toast.innerHTML = `
    <svg class="icon-sm ${iconColor}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconSvg}</svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), isDanger ? 5000 : 3200);
}

function formatNow() {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resetDemoData() {
  if (confirm('Reset entire inventory database to fresh factory demo data?')) {
    state.resetDemo();
    populateCategorySelects();
    renderAllViews();
    showToast('Demo data restored successfully!');
  }
}

function printBarcodeLabel() {
  window.print();
}

function exportProductsCSV() {
  let csv = 'ID,Name,SKU,Category,Warehouse,Stock,MinStock,Price,Cost,Barcode\n';
  state.products.forEach(p => {
    csv += `"${p.id}","${p.name}","${p.sku}","${p.category}","${p.warehouse}",${p.stock},${p.minStock},${p.price},${p.cost},"${p.barcode}"\n`;
  });
  downloadFile(csv, 'stocksense_products_export.csv', 'text/csv');
}

function exportAuditLedgerCSV() {
  let csv = 'Timestamp,Type,Reference,Product,SKU,Path,Delta,Balance,User\n';
  state.history.forEach(h => {
    csv += `"${h.timestamp}","${h.type}","${h.ref}","${h.product}","${h.sku}","${h.path}","${h.delta}","${h.balance}","${h.user}"\n`;
  });
  downloadFile(csv, 'stocksense_audit_ledger.csv', 'text/csv');
}

function exportFullInventoryReport() {
  exportProductsCSV();
  showToast('Inventory Report CSV downloaded.');
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
