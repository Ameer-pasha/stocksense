const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve the frontend static files (index.html, app.js, styles.css)
const frontendPath = path.join(__dirname, '..', '..', 'frontend');
const publicPath = path.join(__dirname, '..', '..', 'public');
app.use(express.static(frontendPath));
app.use(express.static(publicPath));

// In-Memory Data Store (Initialized with StockSense Seed Data)
let categories = [
  { id: 'CAT-1', name: 'Electronics & Sensors', count: 4, value: 84500 },
  { id: 'CAT-2', name: 'Mechanical & Bearings', count: 3, value: 42300 },
  { id: 'CAT-3', name: 'Hardware & Fasteners', count: 2, value: 12400 },
  { id: 'CAT-4', name: 'Raw Metals & Racks', count: 2, value: 28900 },
  { id: 'CAT-5', name: 'Automotive Components', count: 2, value: 16850 }
];

let warehouses = [
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

let products = [
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

let adjustments = [
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
    delta: 5,
    reason: 'Found Unrecorded Stock',
    auditor: 'Prince',
    date: '2026-09-24 10:15'
  }
];

let receipts = [
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

let deliveries = [
  {
    id: 'DEL-2026-089',
    customer: 'Tesla Gigafactory Texas',
    warehouse: 'WH-MAIN',
    date: '2026-09-25',
    itemsDispatched: '40 x Solar Inverter V3',
    status: 'Done',
    items: [{ productId: 'PRD-000101', qty: 40 }]
  },
  {
    id: 'DEL-2026-090',
    customer: 'Boeing Space Logistics',
    warehouse: 'WH-MAIN',
    date: '2026-09-26',
    itemsDispatched: '10 x Fastener Bolts M8',
    status: 'Done',
    items: [{ productId: 'PRD-000107', qty: 10 }]
  },
  {
    id: 'DEL-2026-091',
    customer: 'Siemens Energy Hub',
    warehouse: 'WH-SOUTH',
    date: '2026-09-28',
    itemsDispatched: '15 x Hydraulic Actuator',
    status: 'Packing',
    items: [{ productId: 'PRD-000105', qty: 15 }]
  },
  {
    id: 'DEL-2026-092',
    customer: 'Amazon Robotics Center',
    warehouse: 'WH-EAST',
    date: '2026-09-29',
    itemsDispatched: '30 x Rack Rails',
    status: 'Draft',
    items: [{ productId: 'PRD-000106', qty: 30 }]
  }
];

let transfers = [
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

let history = [
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
  }
];

// Helper: sync status based on stock count
function updateProductStatus(p) {
  if (p.stock === 0) p.status = 'OUT_OF_STOCK';
  else if (p.stock <= p.minStock) p.status = 'LOW_STOCK';
  else p.status = 'IN_STOCK';
  return p;
}

// ============================================================================
// ROUTES
// ============================================================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'StockSense Modular API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: {
      products: products.length,
      warehouses: warehouses.length,
      categories: categories.length,
      adjustments: adjustments.length
    }
  });
});

// Demo & Persistent Users Store
let users = [
  { id: 'usr-001', name: 'Ameer Pasha', email: 'ameer@stocksense.io', role: 'admin', password: 'password123' },
  { id: 'usr-002', name: 'Member 4', email: 'member4@stocksense.io', role: 'admin', password: 'password123' },
  { id: 'usr-003', name: 'Prince', email: 'prince@stocksense.io', role: 'staff', password: 'password123' },
  { id: 'usr-004', name: 'Tarun', email: 'tarun@stocksense.io', role: 'manager', password: 'password123' },
  { id: 'usr-005', name: 'Faizan', email: 'faizan@stocksense.io', role: 'staff', password: 'password123' }
];

// 1.5 Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user || (password && password !== user.password && password !== 'password123')) {
    return res.status(401).json({ success: false, error: 'Invalid credentials. Use password: password123' });
  }

  const token = `token-${user.id}-${Date.now()}`;
  res.json({
    success: true,
    message: `Logged in as ${user.name}`,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) return res.status(409).json({ error: 'User already registered with this email' });

  const newUser = {
    id: `usr-00${users.length + 1}`,
    name,
    email: email.trim().toLowerCase(),
    role: 'staff',
    password: password || 'password123'
  };
  users.push(newUser);
  const token = `token-${newUser.id}-${Date.now()}`;
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: 'OTP verification code sent to ' + email,
    data: { otp: '4829' }
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (otp === '4829' || /^\d{4,6}$/.test(otp)) {
    return res.json({ success: true, message: 'OTP verified successfully', resetToken: 'reset-token-valid' });
  }
  res.status(400).json({ error: 'Invalid OTP code' });
});

app.post('/api/auth/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password updated successfully. Please log in.' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, data: { user: users[0] } });
});

// 2. Dashboard KPIs
app.get('/api/dashboard', (req, res) => {
  let totalStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let totalValuation = 0;

  products.forEach(p => {
    updateProductStatus(p);
    totalStock += p.stock;
    totalValuation += (p.stock * (p.price || 0));
    if (p.stock === 0) outOfStock++;
    else if (p.stock <= p.minStock) lowStock++;
  });

  res.json({
    kpis: {
      totalStock,
      lowStock,
      outOfStock,
      totalValuation,
      totalWarehouses: warehouses.length,
      totalCategories: categories.length
    },
    recentOperations: history.slice(0, 5)
  });
});

// 3. Products Endpoints (Tarun & Prince scope)
app.get('/api/products', (req, res) => {
  const { warehouse, category, status, search } = req.query;
  let filtered = [...products].map(updateProductStatus);

  if (warehouse && warehouse !== 'ALL') {
    filtered = filtered.filter(p => p.warehouse === warehouse);
  }
  if (category && category !== 'ALL') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter(p => p.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    );
  }

  res.json({ data: filtered, count: filtered.length });
});

app.get('/api/products/:id', (req, res) => {
  const p = products.find(item => item.id === req.params.id || item.sku === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json({ data: updateProductStatus(p) });
});

app.post('/api/products', (req, res) => {
  const body = req.body;
  if (!body.name || !body.sku) {
    return res.status(400).json({ error: 'Product name and SKU are required.' });
  }

  const newProduct = {
    id: body.id || `PRD-${Date.now().toString().slice(-6)}`,
    name: body.name,
    sku: body.sku,
    category: body.category || 'General',
    warehouse: body.warehouse || 'WH-MAIN',
    bin: body.bin || 'A-01-01',
    stock: parseInt(body.stock || 0, 10),
    minStock: parseInt(body.minStock || 10, 10),
    price: parseFloat(body.price || 0),
    cost: parseFloat(body.cost || 0),
    barcode: body.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    description: body.description || ''
  };

  updateProductStatus(newProduct);
  products.unshift(newProduct);

  // Add ledger entry
  history.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    type: 'PRODUCT_CREATED',
    ref: newProduct.id,
    product: newProduct.name,
    sku: newProduct.sku,
    path: `${newProduct.warehouse} (Initial Entry)`,
    delta: `+${newProduct.stock} units`,
    balance: `${newProduct.stock} units`,
    user: 'System Admin'
  });

  res.status(201).json({ message: 'Product created successfully', data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const p = products.find(item => item.id === req.params.id || item.sku === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });

  const body = req.body;
  if (body.name !== undefined) p.name = body.name;
  if (body.sku !== undefined) p.sku = body.sku;
  if (body.category !== undefined) p.category = body.category;
  if (body.warehouse !== undefined) p.warehouse = body.warehouse;
  if (body.bin !== undefined) p.bin = body.bin;
  if (body.stock !== undefined) p.stock = parseInt(body.stock, 10);
  if (body.minStock !== undefined) p.minStock = parseInt(body.minStock, 10);
  if (body.price !== undefined) p.price = parseFloat(body.price);
  if (body.cost !== undefined) p.cost = parseFloat(body.cost);
  if (body.barcode !== undefined) p.barcode = body.barcode;
  if (body.description !== undefined) p.description = body.description;

  updateProductStatus(p);
  res.json({ message: 'Product updated successfully', data: p });
});

app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(item => item.id === req.params.id || item.sku === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const deleted = products.splice(idx, 1)[0];
  res.json({ message: 'Product deleted', data: deleted });
});

// 4. Warehouses Endpoints (Ameer scope)
app.get('/api/warehouses', (req, res) => {
  res.json({ data: warehouses });
});

app.post('/api/warehouses', (req, res) => {
  const { name, code, zone, capacity, manager, location } = req.body;
  const newWh = {
    id: `WH-${Date.now().toString().slice(-4)}`,
    name,
    code: code || `WH-0${warehouses.length + 1}`,
    zone: zone || 'General Zone',
    capacity: capacity || 50,
    skus: 0,
    manager: manager || 'Logistics Lead',
    location: location || 'Central'
  };
  warehouses.push(newWh);
  res.status(201).json({ message: 'Warehouse registered', data: newWh });
});

// 5. Categories Endpoints
app.get('/api/categories', (req, res) => {
  res.json({ data: categories });
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });
  const newCat = {
    id: `CAT-${Date.now().toString().slice(-4)}`,
    name,
    count: 0,
    value: 0
  };
  categories.push(newCat);
  res.status(201).json({ message: 'Category added', data: newCat });
});

app.delete('/api/categories/:id', (req, res) => {
  const idx = categories.findIndex(c => c.id === req.params.id || c.name === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Category not found' });
  const deleted = categories.splice(idx, 1)[0];
  res.json({ message: 'Category removed', data: deleted });
});

// Initialize Member 3 bridge with catalog products
const {
  receiptService,
  deliveryService,
  transferService,
  adjustmentService,
  operationsStore,
  seedOperationsStore,
  syncProductStock,
  mapLedgerEntryToHistory
} = require('./services/member3Bridge');

seedOperationsStore(products);

// 6. Stock Adjustments Endpoints (Tarun & Ameer scope)
app.get('/api/adjustments', (req, res) => {
  res.json({ data: adjustments });
});

app.get('/api/stock-adjustments', (req, res) => {
  res.json({ data: adjustments });
});

app.post('/api/adjustments', (req, res) => {
  const { productId, realStock, countedQuantity, reason, remarks, auditor } = req.body;
  const p = products.find(item => item.id === productId || item.sku === productId);
  if (!p) return res.status(404).json({ error: 'Product not found for adjustment' });

  const finalRealStock = parseInt(countedQuantity !== undefined ? countedQuantity : realStock, 10);
  const systemStock = p.stock;
  const delta = finalRealStock - systemStock;

  // Execute domain adjustment in Member 3 engine
  const validReason = ['damaged', 'lost', 'found', 'miscount', 'expired', 'theft', 'audit'].includes((reason || '').toLowerCase())
    ? reason.toLowerCase()
    : 'audit';

  try {
    adjustmentService.create({
      productId: p.id,
      warehouseId: p.warehouse,
      warehouseName: warehouses.find(w => w.id === p.warehouse)?.name || p.warehouse,
      locationCode: p.bin || 'Rack A (Bulk Steel & Heavy Goods)',
      countedQuantity: finalRealStock,
      reason: validReason,
      remarks: remarks || reason || 'Physical count audit',
      auditedBy: auditor || 'Inventory Auditor'
    });
  } catch (err) {
    console.warn('[AdjustmentService Warn]', err.message);
  }

  // Apply change to product in master catalog
  p.stock = Math.max(0, finalRealStock);
  updateProductStatus(p);

  const newAdj = {
    id: `ADJ-2026-${Date.now().toString().slice(-4)}`,
    product: p.name,
    productId: p.id,
    warehouse: p.warehouse,
    systemStock,
    realStock: finalRealStock,
    delta,
    reason: reason || 'Inventory Discrepancy Adjustment',
    auditor: auditor || 'Inventory Auditor',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };

  adjustments.unshift(newAdj);

  // Add ledger audit record
  history.unshift({
    timestamp: newAdj.date,
    type: 'ADJUSTMENT',
    ref: newAdj.id,
    product: p.name,
    sku: p.sku,
    path: `${p.warehouse} (Cycle Count Audit)`,
    delta: `${delta > 0 ? '+' + delta : delta} units`,
    balance: `${p.stock} units`,
    user: newAdj.auditor
  });

  res.status(201).json({ message: 'Stock adjustment applied', data: newAdj, product: p });
});

// 7. Receipts Endpoints
app.get('/api/receipts', (req, res) => {
  res.json({ data: receipts });
});

app.post('/api/receipts', (req, res) => {
  const isDirectDone = req.body.status === 'Done' || req.body.status === 'done';
  const newRec = {
    id: req.body.id || `REC-2026-00${receipts.length + 1}`,
    supplier: req.body.supplier || req.body.supplierName || 'General Supplier',
    warehouse: req.body.warehouse || req.body.warehouseId || 'WH-MAIN',
    date: req.body.date || req.body.receiptDate || new Date().toISOString().split('T')[0],
    itemsCount: req.body.itemsCount || 0,
    totalValue: req.body.totalValue || 0,
    status: isDirectDone ? 'Done' : (req.body.status || 'Draft'),
    items: req.body.items || []
  };

  // If directly validated or items specified, register with Member 3 service
  try {
    receiptService.create({
      supplierName: newRec.supplier,
      warehouseId: newRec.warehouse,
      locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
      receiptDate: newRec.date,
      items: newRec.items.map(i => ({
        productId: i.productId,
        quantity: i.qty || i.quantity || 1,
        unitPrice: i.cost || i.unitPrice || 0
      }))
    });
  } catch (err) {
    console.warn('[ReceiptService Warn]', err.message);
  }

  // If validated immediately, increment stock
  if (isDirectDone && newRec.items) {
    newRec.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId || prod.sku === item.productId);
      if (p) {
        const qtyToAdd = Number(item.qty || item.quantity || 0);
        p.stock += qtyToAdd;
        updateProductStatus(p);

        history.unshift({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'RECEIPT',
          ref: newRec.id,
          product: p.name,
          sku: p.sku,
          path: `${newRec.supplier} → ${newRec.warehouse}`,
          delta: `+${qtyToAdd} units`,
          balance: `${p.stock} units`,
          user: 'Ameer Pasha'
        });
      }
    });
  }

  receipts.unshift(newRec);
  res.status(201).json({ message: 'Receipt created', data: newRec });
});

app.put('/api/receipts/:id/validate', (req, res) => {
  const r = receipts.find(item => item.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Receipt not found' });
  if (r.status === 'Done') return res.status(400).json({ error: 'Receipt already validated' });

  r.status = 'Done';
  if (r.items) {
    r.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId || prod.sku === item.productId);
      if (p) {
        const qtyToAdd = Number(item.qty || item.quantity || 0);
        p.stock += qtyToAdd;
        updateProductStatus(p);

        history.unshift({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'RECEIPT',
          ref: r.id,
          product: p.name,
          sku: p.sku,
          path: `${r.supplier} → ${r.warehouse}`,
          delta: `+${qtyToAdd} units`,
          balance: `${p.stock} units`,
          user: 'Ameer Pasha'
        });
      }
    });
  }

  res.json({ message: 'Receipt validated', data: r });
});

app.put('/api/receipts/:id', (req, res) => {
  const r = receipts.find(item => item.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Receipt not found' });

  if (req.body.status === 'Done' && r.status !== 'Done') {
    return app._router.handle({ ...req, method: 'PUT', url: `/api/receipts/${req.params.id}/validate` }, res);
  }

  if (req.body.status) r.status = req.body.status;
  res.json({ message: 'Receipt updated', data: r });
});

// 8. Deliveries Endpoints (With Shortage Prevention Gate)
app.get('/api/deliveries', (req, res) => {
  res.json({ data: deliveries });
});

app.get('/api/deliveries/:id/availability', (req, res) => {
  const d = deliveries.find(item => item.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Delivery order not found' });

  const auditItems = (d.items || []).map(item => {
    const p = products.find(prod => prod.id === item.productId || prod.sku === item.productId);
    const available = p ? p.stock : 0;
    const requested = Number(item.qty || item.quantity || 0);
    return {
      productId: item.productId,
      requested,
      available,
      isAvailable: available >= requested,
      shortage: Math.max(0, requested - available)
    };
  });

  const allAvailable = auditItems.every(i => i.isAvailable);
  res.json({ deliveryId: d.id, allAvailable, items: auditItems });
});

app.post('/api/deliveries', (req, res) => {
  const items = req.body.items || [];
  const warehouse = req.body.warehouse || req.body.warehouseId || 'WH-MAIN';
  const shouldValidateNow = req.body.status === 'Done' || !req.body.status || req.body.status === 'done';

  // 1. Enforce Shortage Prevention Gate if dispatching directly
  if (shouldValidateNow) {
    for (const item of items) {
      const p = products.find(prod => prod.id === item.productId || prod.sku === item.productId);
      const requested = Number(item.qty || item.quantity || 0);
      const available = p ? p.stock : 0;

      if (available < requested) {
        return res.status(400).json({
          success: false,
          error: `Cannot dispatch delivery due to insufficient stock in ${warehouse}: ${p ? p.name : item.productId} (Available: ${available}, Demanded: ${requested}, Short by: ${requested - available})`,
          shortage: true,
          productId: item.productId,
          available,
          requested
        });
      }
    }
  }

  const newDel = {
    id: req.body.id || `DEL-2026-0${deliveries.length + 90}`,
    customer: req.body.customer || req.body.customerName || 'Standard Customer',
    warehouse,
    date: req.body.date || req.body.deliveryDate || new Date().toISOString().split('T')[0],
    itemsDispatched: req.body.itemsDispatched || `${items.reduce((s, i) => s + (i.qty || 1), 0)} units`,
    status: shouldValidateNow ? 'Done' : (req.body.status || 'Draft'),
    items
  };

  // If validated, deduct stock and record in ledger
  if (shouldValidateNow) {
    items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId || prod.sku === item.productId);
      if (p) {
        const qtyToDeduct = Number(item.qty || item.quantity || 0);
        p.stock = Math.max(0, p.stock - qtyToDeduct);
        updateProductStatus(p);

        history.unshift({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'DELIVERY',
          ref: newDel.id,
          product: p.name,
          sku: p.sku,
          path: `${newDel.warehouse} → ${newDel.customer}`,
          delta: `-${qtyToDeduct} units`,
          balance: `${p.stock} units`,
          user: 'Ameer Pasha'
        });
      }
    });
  }

  deliveries.unshift(newDel);
  res.status(201).json({ message: 'Delivery order created', data: newDel });
});

app.put('/api/deliveries/:id/validate', (req, res) => {
  const d = deliveries.find(item => item.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Delivery order not found' });
  if (d.status === 'Done') return res.status(400).json({ error: 'Delivery already shipped' });

  // Shortage check before dispatch
  for (const item of (d.items || [])) {
    const p = products.find(prod => prod.id === item.productId || prod.sku === item.productId);
    const requested = Number(item.qty || item.quantity || 0);
    const available = p ? p.stock : 0;

    if (available < requested) {
      return res.status(400).json({
        success: false,
        error: `Cannot dispatch delivery due to insufficient stock in ${d.warehouse}: ${p ? p.name : item.productId} (Available: ${available}, Demanded: ${requested}, Short by: ${requested - available})`,
        shortage: true
      });
    }
  }

  // Deduct stock
  (d.items || []).forEach(item => {
    const p = products.find(prod => prod.id === item.productId || prod.sku === item.productId);
    if (p) {
      const qtyToDeduct = Number(item.qty || item.quantity || 0);
      p.stock = Math.max(0, p.stock - qtyToDeduct);
      updateProductStatus(p);

      history.unshift({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        type: 'DELIVERY',
        ref: d.id,
        product: p.name,
        sku: p.sku,
        path: `${d.warehouse} → ${d.customer}`,
        delta: `-${qtyToDeduct} units`,
        balance: `${p.stock} units`,
        user: 'Ameer Pasha'
      });
    }
  });

  d.status = 'Done';
  res.json({ message: 'Delivery order fulfilled and dispatched', data: d });
});

app.put('/api/deliveries/:id', (req, res) => {
  const d = deliveries.find(item => item.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Delivery order not found' });

  if (req.body.status === 'Done' && d.status !== 'Done') {
    return app._router.handle({ ...req, method: 'PUT', url: `/api/deliveries/${req.params.id}/validate` }, res);
  }

  if (req.body.status) d.status = req.body.status;
  res.json({ message: 'Delivery order updated', data: d });
});

// 9. Transfers Endpoints (Two-Phase Commit Protocol)
app.get('/api/transfers', (req, res) => {
  res.json({ data: transfers });
});

app.post('/api/transfers', (req, res) => {
  const source = req.body.source || req.body.sourceWarehouseId || 'WH-MAIN';
  const dest = req.body.dest || req.body.destWarehouseId || 'WH-NORTH';
  const prodId = req.body.productId;
  const qty = parseInt(req.body.qty || req.body.quantity || 1, 10);

  if (source === dest) {
    return res.status(400).json({ error: 'Source and destination warehouses cannot be identical.' });
  }

  const p = products.find(item => item.id === prodId || item.sku === prodId);
  if (p && p.stock < qty) {
    return res.status(400).json({
      error: `Insufficient stock in ${source} for ${p.name}. Available: ${p.stock}, Requested: ${qty}`
    });
  }

  // Phase 1: Confirm dispatch (origin stock deducted, status becomes In-Transit)
  if (p) {
    p.stock = Math.max(0, p.stock - qty);
    updateProductStatus(p);
  }

  const newTrf = {
    id: req.body.id || `TRF-2026-0${transfers.length + 40}`,
    source,
    dest,
    product: p ? p.name : (req.body.product || 'Stock Item'),
    productId: prodId,
    qty,
    date: req.body.date || new Date().toISOString().split('T')[0],
    status: 'In-Transit',
    reason: req.body.reason || 'Stock Rebalancing'
  };

  history.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    type: 'TRANSFER',
    ref: newTrf.id,
    product: newTrf.product,
    sku: p ? p.sku : newTrf.productId,
    path: `${source} → ${dest}`,
    delta: `-${qty} (in-transit)`,
    balance: `${p ? p.stock : 0} units`,
    user: 'Ameer Pasha'
  });

  transfers.unshift(newTrf);
  res.status(201).json({ message: 'Transfer scheduled and dispatched (In-Transit)', data: newTrf });
});

app.put('/api/transfers/:id/complete', (req, res) => {
  const t = transfers.find(item => item.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Transfer not found' });
  if (t.status === 'Completed' || t.status === 'done') {
    return res.status(400).json({ error: 'Transfer already completed' });
  }

  // Phase 2: Complete arrival at destination
  const sourceProduct = products.find(item => item.id === t.productId || item.sku === t.productId);
  let destProd = products.find(item => (item.sku === (sourceProduct ? sourceProduct.sku : t.productId) || item.id === t.productId) && item.warehouse === t.dest);

  if (destProd) {
    destProd.stock += t.qty;
    updateProductStatus(destProd);
  } else if (sourceProduct && sourceProduct.warehouse !== t.dest) {
    destProd = {
      ...sourceProduct,
      id: `PRD-${Date.now().toString().slice(-6)}`,
      warehouse: t.dest,
      stock: t.qty,
      status: 'IN_STOCK'
    };
    updateProductStatus(destProd);
    products.push(destProd);
  } else if (sourceProduct) {
    sourceProduct.stock += t.qty;
    updateProductStatus(sourceProduct);
  }

  t.status = 'Completed';

  history.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    type: 'TRANSFER',
    ref: t.id,
    product: t.product,
    sku: sourceProduct ? sourceProduct.sku : t.productId,
    path: `Received at ${t.dest}`,
    delta: `+${t.qty} units`,
    balance: `${destProd ? destProd.stock : (sourceProduct ? sourceProduct.stock : t.qty)} units`,
    user: 'Ameer Pasha'
  });

  res.json({ message: 'Transfer received and completed at destination', data: t });
});

app.put('/api/transfers/:id', (req, res) => {
  const t = transfers.find(item => item.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Transfer not found' });

  if ((req.body.status === 'Completed' || req.body.status === 'done') && t.status !== 'Completed') {
    return app._router.handle({ ...req, method: 'PUT', url: `/api/transfers/${req.params.id}/complete` }, res);
  }

  if (req.body.status) t.status = req.body.status;
  res.json({ message: 'Transfer updated', data: t });
});

// 10. Alerts Endpoints
app.get('/api/alerts', (req, res) => {
  const alerts = [];
  products.forEach(p => {
    if (p.stock === 0) {
      alerts.push({
        id: `alert-out-${p.id}`,
        title: `Out of Stock: ${p.name}`,
        desc: `${p.warehouse} has 0 units available. Immediate reorder suggested.`,
        type: 'danger',
        time: 'Active',
        product: p
      });
    } else if (p.stock <= p.minStock) {
      alerts.push({
        id: `alert-low-${p.id}`,
        title: `Low Stock Alert: ${p.name}`,
        desc: `Current stock is ${p.stock} (Threshold: ${p.minStock}). Reorder recommended.`,
        type: 'warning',
        time: 'Active',
        product: p
      });
    }
  });
  res.json({ data: alerts, count: alerts.length });
});

// 11. Audit Ledger / History Endpoints
app.get('/api/history', (req, res) => {
  res.json({ data: history });
});

app.get('/api/ledger', (req, res) => {
  res.json({ data: history });
});

// Catch-all: serve frontend index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
