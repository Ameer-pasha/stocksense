// StockSense In-Memory & LocalStorage Mock Database Layer
// Represents the Shared Database / DB Layer owned by teammate.
// Member 2 services consume this layer via API abstractions.

const STORAGE_KEY = 'stocksense_inventory_db_v2';

const INITIAL_DATA = {
  warehouses: [
    {
      id: 1,
      name: 'Bangalore Central DC',
      code: 'WH-BLR-01',
      address: 'Plot 42, Electronic City Phase 2',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
      capacity_sqft: 45000,
      is_active: true
    },
    {
      id: 2,
      name: 'Mysore Overflow Facility',
      code: 'WH-MYS-01',
      address: 'Hebbal Industrial Area, Sector 4',
      city: 'Mysore',
      state: 'Karnataka',
      pincode: '570016',
      capacity_sqft: 22000,
      is_active: true
    },
    {
      id: 3,
      name: 'Pune Distribution Hub',
      code: 'WH-PUN-01',
      address: 'Chakan MIDC Phase 3',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '410501',
      capacity_sqft: 35000,
      is_active: false
    }
  ],
  categories: [
    { id: 1, name: 'Raw Materials', code: 'RAW', description: 'Core industrial inputs and metals', parent_id: null, is_active: true },
    { id: 2, name: 'Steel & Alloys', code: 'STL', description: 'Structural steel, rods, and coils', parent_id: 1, is_active: true },
    { id: 3, name: 'Finished Goods', code: 'FG', description: 'Packaged ready-for-dispatch items', parent_id: null, is_active: true },
    { id: 4, name: 'Industrial Electronics', code: 'ELEC', description: 'Sensors, microcontrollers, and relays', parent_id: null, is_active: true },
    { id: 5, name: 'Fasteners & Hardware', code: 'FAST', description: 'Bolts, nuts, rivets, and brackets', parent_id: 1, is_active: true }
  ],
  locations: [
    // Bangalore Central DC (id: 1)
    { id: 101, warehouse_id: 1, parent_id: null, name: 'Receiving Bay A', code: 'WH1-RCV-A', type: 'bay', full_path: 'Receiving Bay A', is_active: true },
    { id: 102, warehouse_id: 1, parent_id: null, name: 'Zone 1 (Heavy Metal Storage)', code: 'WH1-Z1', type: 'zone', full_path: 'Zone 1 (Heavy Metal Storage)', is_active: true },
    { id: 103, warehouse_id: 1, parent_id: 102, name: 'Aisle 01', code: 'WH1-Z1-A1', type: 'rack', full_path: 'Zone 1 > Aisle 01', is_active: true },
    { id: 104, warehouse_id: 1, parent_id: 103, name: 'Rack R-12', code: 'WH1-Z1-A1-R12', type: 'rack', full_path: 'Zone 1 > Aisle 01 > Rack R-12', is_active: true },
    { id: 105, warehouse_id: 1, parent_id: 104, name: 'Shelf S-01 (Heavy Duty)', code: 'WH1-R12-S01', type: 'shelf', full_path: 'Zone 1 > Aisle 01 > Rack R-12 > Shelf S-01', is_active: true },
    { id: 106, warehouse_id: 1, parent_id: 104, name: 'Shelf S-02 (Heavy Duty)', code: 'WH1-R12-S02', type: 'shelf', full_path: 'Zone 1 > Aisle 01 > Rack R-12 > Shelf S-02', is_active: true },
    { id: 107, warehouse_id: 1, parent_id: null, name: 'Zone 2 (Electronics Climate Controlled)', code: 'WH1-Z2', type: 'zone', full_path: 'Zone 2 (Electronics Climate Controlled)', is_active: true },
    { id: 108, warehouse_id: 1, parent_id: 107, name: 'Bin E-404', code: 'WH1-Z2-BIN404', type: 'bin', full_path: 'Zone 2 > Bin E-404', is_active: true },
    
    // Mysore Overflow Facility (id: 2)
    { id: 201, warehouse_id: 2, parent_id: null, name: 'Main Staging Ground', code: 'WH2-STG', type: 'zone', full_path: 'Main Staging Ground', is_active: true },
    { id: 202, warehouse_id: 2, parent_id: 201, name: 'Bulk Pallet Row 04', code: 'WH2-PLT-04', type: 'rack', full_path: 'Main Staging Ground > Bulk Pallet Row 04', is_active: true },
    { id: 203, warehouse_id: 2, parent_id: 202, name: 'Bin M-10', code: 'WH2-BIN-10', type: 'bin', full_path: 'Main Staging Ground > Bulk Pallet Row 04 > Bin M-10', is_active: true }
  ],
  products: [
    {
      id: 1,
      name: 'Mild Steel Rod 12mm',
      sku: 'STL-001',
      category_id: 2,
      unit_of_measure: 'kg',
      description: 'High tensile structural grade bar (IS 1786 Fe 500D). 6-meter bundle.',
      is_active: true,
      created_at: '2026-09-20T10:00:00Z'
    },
    {
      id: 2,
      name: 'Hex Head Bolt M10 x 50mm',
      sku: 'FAST-010',
      category_id: 5,
      unit_of_measure: 'box',
      description: 'Grade 8.8 zinc plated industrial fasteners (100 pcs per box).',
      is_active: true,
      created_at: '2026-09-21T11:30:00Z'
    },
    {
      id: 3,
      name: 'Digital Optical Proximity Sensor',
      sku: 'SENS-088',
      category_id: 4,
      unit_of_measure: 'pcs',
      description: 'IP67 rated photoelectric diffuse reflective sensor with NPN output.',
      is_active: true,
      created_at: '2026-09-22T09:15:00Z'
    },
    {
      id: 4,
      name: 'Ergonomic Mesh Assembly Chair',
      sku: 'CHR-901',
      category_id: 3,
      unit_of_measure: 'pcs',
      description: 'ESD-safe production workstation chair with pneumatic lift.',
      is_active: true,
      created_at: '2026-09-23T14:45:00Z'
    },
    {
      id: 5,
      name: 'Aluminum Extrusion Profile 40x40',
      sku: 'ALU-4040',
      category_id: 1,
      unit_of_measure: 'mtr',
      description: 'T-slot anodized architectural profile for modular machine framing.',
      is_active: false,
      created_at: '2026-09-24T08:00:00Z'
    }
  ],
  // Read-only stock ledger view owned by Member 1, consumed by Member 2
  stock_records: [
    { product_id: 1, warehouse_id: 1, location_id: 105, quantity: 180 },
    { product_id: 1, warehouse_id: 1, location_id: 106, quantity: 60 },
    { product_id: 1, warehouse_id: 2, location_id: 203, quantity: 45 },
    { product_id: 2, warehouse_id: 1, location_id: 105, quantity: 18 },
    { product_id: 3, warehouse_id: 1, location_id: 108, quantity: 6 },
    { product_id: 4, warehouse_id: 1, location_id: 101, quantity: 32 }
  ],
  reorder_rules: [
    {
      id: 1,
      product_id: 1,
      location_id: 105,
      min_quantity: 100,
      max_quantity: 500,
      reorder_quantity: 200,
      is_active: true
    },
    {
      id: 2,
      product_id: 2,
      location_id: 105,
      min_quantity: 25,
      max_quantity: 150,
      reorder_quantity: 50,
      is_active: true
    },
    {
      id: 3,
      product_id: 3,
      location_id: 108,
      min_quantity: 15,
      max_quantity: 80,
      reorder_quantity: 25,
      is_active: true
    }
  ]
};

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[MockStore] Failed to read localStorage, using default seed:', err);
    return INITIAL_DATA;
  }
}

function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[MockStore] Failed to save localStorage:', err);
  }
}

export const inventoryMockStore = {
  // Products
  getProducts(filters = {}) {
    const data = loadStore();
    let items = [...data.products];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (filters.category_id) {
      items = items.filter(p => p.category_id === Number(filters.category_id));
    }
    if (filters.is_active !== undefined && filters.is_active !== '') {
      const activeBool = filters.is_active === true || filters.is_active === 'true';
      items = items.filter(p => p.is_active === activeBool);
    }
    if (filters.warehouse_id) {
      const whId = Number(filters.warehouse_id);
      const productIdsInWh = new Set(
        data.stock_records.filter(s => s.warehouse_id === whId && s.quantity > 0).map(s => s.product_id)
      );
      items = items.filter(p => productIdsInWh.has(p.id));
    }

    // Attach Category Name & Total Available Stock
    const categoryMap = Object.fromEntries(data.categories.map(c => [c.id, c.name]));
    const stockMap = {};
    for (const record of data.stock_records) {
      stockMap[record.product_id] = (stockMap[record.product_id] || 0) + record.quantity;
    }

    return items.map(p => ({
      ...p,
      category_name: categoryMap[p.category_id] || 'Unassigned',
      total_available_stock: stockMap[p.id] || 0
    }));
  },

  getProductById(id) {
    const data = loadStore();
    const p = data.products.find(item => item.id === Number(id));
    if (!p) return null;
    const cat = data.categories.find(c => c.id === p.category_id);
    return {
      ...p,
      category_name: cat ? cat.name : 'Unassigned'
    };
  },

  createProduct(payload) {
    const data = loadStore();
    const cleanSku = payload.sku.trim().toUpperCase();
    if (data.products.some(p => p.sku === cleanSku)) {
      throw new Error(`Product with SKU '${cleanSku}' already exists.`);
    }

    const newProduct = {
      id: Date.now(),
      name: payload.name.trim(),
      sku: cleanSku,
      category_id: Number(payload.category_id),
      unit_of_measure: payload.unit_of_measure.trim().toLowerCase(),
      description: (payload.description || '').trim(),
      is_active: true,
      created_at: new Date().toISOString()
    };

    data.products.unshift(newProduct);
    saveStore(data);
    return this.getProductById(newProduct.id);
  },

  updateProduct(id, payload) {
    const data = loadStore();
    const idx = data.products.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error(`Product ${id} not found`);

    data.products[idx] = {
      ...data.products[idx],
      name: payload.name !== undefined ? payload.name.trim() : data.products[idx].name,
      category_id: payload.category_id ? Number(payload.category_id) : data.products[idx].category_id,
      unit_of_measure: payload.unit_of_measure || data.products[idx].unit_of_measure,
      description: payload.description !== undefined ? payload.description.trim() : data.products[idx].description,
      updated_at: new Date().toISOString()
    };

    saveStore(data);
    return this.getProductById(id);
  },

  setProductStatus(id, isActive) {
    const data = loadStore();
    const idx = data.products.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error(`Product ${id} not found`);
    data.products[idx].is_active = Boolean(isActive);
    saveStore(data);
    return data.products[idx];
  },

  // Read-only stock availability presentation
  getProductAvailability(productId) {
    const data = loadStore();
    const product = this.getProductById(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    const whMap = Object.fromEntries(data.warehouses.map(w => [w.id, w.name]));
    const locMap = Object.fromEntries(data.locations.map(l => [l.id, l]));

    const locations = data.stock_records
      .filter(s => s.product_id === Number(productId))
      .map(s => {
        const loc = locMap[s.location_id] || {};
        return {
          warehouse_id: s.warehouse_id,
          warehouse_name: whMap[s.warehouse_id] || `WH-${s.warehouse_id}`,
          location_id: s.location_id,
          location_code: loc.code || 'LOC-N/A',
          location_name: loc.full_path || loc.name || 'General Storage',
          available_quantity: s.quantity
        };
      });

    const totalStock = locations.reduce((acc, curr) => acc + curr.available_quantity, 0);

    return {
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit_of_measure,
      total_stock: totalStock,
      locations
    };
  },

  // Categories
  getCategories(tree = false) {
    const data = loadStore();
    const cats = [...data.categories];
    if (!tree) return cats;

    const lookup = {};
    cats.forEach(c => { lookup[c.id] = { ...c, children: [] }; });
    const roots = [];
    cats.forEach(c => {
      if (c.parent_id && lookup[c.parent_id]) {
        lookup[c.parent_id].children.push(lookup[c.id]);
      } else {
        roots.push(lookup[c.id]);
      }
    });
    return roots;
  },

  createCategory(payload) {
    const data = loadStore();
    const cleanName = payload.name.trim();
    if (data.categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      throw new Error(`Category '${cleanName}' already exists.`);
    }

    const newCat = {
      id: Date.now(),
      name: cleanName,
      code: (payload.code || cleanName.slice(0, 4)).trim().toUpperCase(),
      description: (payload.description || '').trim(),
      parent_id: payload.parent_id ? Number(payload.parent_id) : null,
      is_active: true
    };
    data.categories.push(newCat);
    saveStore(data);
    return newCat;
  },

  updateCategory(id, payload) {
    const data = loadStore();
    const idx = data.categories.findIndex(c => c.id === Number(id));
    if (idx === -1) throw new Error(`Category ${id} not found`);

    if (payload.parent_id && Number(payload.parent_id) === Number(id)) {
      throw new Error('A category cannot be its own parent.');
    }

    data.categories[idx] = {
      ...data.categories[idx],
      name: payload.name !== undefined ? payload.name.trim() : data.categories[idx].name,
      code: payload.code !== undefined ? payload.code.trim().toUpperCase() : data.categories[idx].code,
      description: payload.description !== undefined ? payload.description.trim() : data.categories[idx].description,
      parent_id: payload.parent_id !== undefined ? (payload.parent_id ? Number(payload.parent_id) : null) : data.categories[idx].parent_id
    };
    saveStore(data);
    return data.categories[idx];
  },

  setCategoryStatus(id, isActive) {
    const data = loadStore();
    const idx = data.categories.findIndex(c => c.id === Number(id));
    if (idx === -1) throw new Error(`Category ${id} not found`);
    data.categories[idx].is_active = Boolean(isActive);
    saveStore(data);
    return data.categories[idx];
  },

  // Warehouses
  getWarehouses() {
    const data = loadStore();
    const locCountMap = {};
    data.locations.forEach(l => {
      locCountMap[l.warehouse_id] = (locCountMap[l.warehouse_id] || 0) + 1;
    });

    return data.warehouses.map(w => ({
      ...w,
      location_count: locCountMap[w.id] || 0
    }));
  },

  getWarehouseById(id) {
    const list = this.getWarehouses();
    return list.find(w => w.id === Number(id)) || null;
  },

  createWarehouse(payload) {
    const data = loadStore();
    const code = payload.code.trim().toUpperCase();
    if (data.warehouses.some(w => w.code === code)) {
      throw new Error(`Warehouse with code '${code}' already exists.`);
    }

    const newWh = {
      id: Date.now(),
      name: payload.name.trim(),
      code,
      address: (payload.address || '').trim(),
      city: (payload.city || '').trim(),
      state: (payload.state || '').trim(),
      pincode: (payload.pincode || '').trim(),
      capacity_sqft: Number(payload.capacity_sqft) || 0,
      is_active: true
    };
    data.warehouses.push(newWh);
    saveStore(data);
    return { ...newWh, location_count: 0 };
  },

  updateWarehouse(id, payload) {
    const data = loadStore();
    const idx = data.warehouses.findIndex(w => w.id === Number(id));
    if (idx === -1) throw new Error(`Warehouse ${id} not found`);

    data.warehouses[idx] = {
      ...data.warehouses[idx],
      name: payload.name !== undefined ? payload.name.trim() : data.warehouses[idx].name,
      address: payload.address !== undefined ? payload.address.trim() : data.warehouses[idx].address,
      city: payload.city !== undefined ? payload.city.trim() : data.warehouses[idx].city,
      state: payload.state !== undefined ? payload.state.trim() : data.warehouses[idx].state,
      pincode: payload.pincode !== undefined ? payload.pincode.trim() : data.warehouses[idx].pincode,
      capacity_sqft: payload.capacity_sqft !== undefined ? Number(payload.capacity_sqft) : data.warehouses[idx].capacity_sqft
    };
    saveStore(data);
    return this.getWarehouseById(id);
  },

  setWarehouseStatus(id, isActive) {
    const data = loadStore();
    const idx = data.warehouses.findIndex(w => w.id === Number(id));
    if (idx === -1) throw new Error(`Warehouse ${id} not found`);
    data.warehouses[idx].is_active = Boolean(isActive);
    saveStore(data);
    return data.warehouses[idx];
  },

  // Locations
  getLocations(warehouseId = null) {
    const data = loadStore();
    let list = [...data.locations];
    if (warehouseId) {
      list = list.filter(l => l.warehouse_id === Number(warehouseId));
    }
    return list;
  },

  getLocationTree(warehouseId) {
    const locations = this.getLocations(warehouseId);
    const lookup = {};
    locations.forEach(l => { lookup[l.id] = { ...l, children: [] }; });
    const roots = [];

    locations.forEach(l => {
      if (l.parent_id && lookup[l.parent_id]) {
        lookup[l.parent_id].children.push(lookup[l.id]);
      } else {
        roots.push(lookup[l.id]);
      }
    });
    return roots;
  },

  createLocation(payload) {
    const data = loadStore();
    const whId = Number(payload.warehouse_id);
    const code = payload.code.trim().toUpperCase();

    if (data.locations.some(l => l.warehouse_id === whId && l.code === code)) {
      throw new Error(`Location code '${code}' already exists in this warehouse.`);
    }

    let parentPath = '';
    if (payload.parent_id) {
      const parent = data.locations.find(l => l.id === Number(payload.parent_id));
      if (!parent) throw new Error(`Parent location ${payload.parent_id} not found.`);
      if (parent.warehouse_id !== whId) throw new Error('Parent location belongs to a different warehouse.');
      parentPath = parent.full_path || parent.name;
    }

    const name = payload.name.trim();
    const fullPath = parentPath ? `${parentPath} > ${name}` : name;

    const newLoc = {
      id: Date.now(),
      warehouse_id: whId,
      parent_id: payload.parent_id ? Number(payload.parent_id) : null,
      name,
      code,
      type: payload.type || 'shelf',
      full_path: fullPath,
      is_active: true
    };

    data.locations.push(newLoc);
    saveStore(data);
    return newLoc;
  },

  updateLocation(id, payload) {
    const data = loadStore();
    const idx = data.locations.findIndex(l => l.id === Number(id));
    if (idx === -1) throw new Error(`Location ${id} not found`);

    data.locations[idx] = {
      ...data.locations[idx],
      name: payload.name !== undefined ? payload.name.trim() : data.locations[idx].name,
      code: payload.code !== undefined ? payload.code.trim().toUpperCase() : data.locations[idx].code,
      type: payload.type || data.locations[idx].type
    };
    saveStore(data);
    return data.locations[idx];
  },

  setLocationStatus(id, isActive) {
    const data = loadStore();
    const idx = data.locations.findIndex(l => l.id === Number(id));
    if (idx === -1) throw new Error(`Location ${id} not found`);
    data.locations[idx].is_active = Boolean(isActive);
    saveStore(data);
    return data.locations[idx];
  },

  // Reordering Rules
  getReorderRules(filters = {}) {
    const data = loadStore();
    let rules = [...data.reorder_rules];

    if (filters.product_id) {
      rules = rules.filter(r => r.product_id === Number(filters.product_id));
    }
    if (filters.location_id) {
      rules = rules.filter(r => r.location_id === Number(filters.location_id));
    }

    const prodMap = Object.fromEntries(data.products.map(p => [p.id, p]));
    const locMap = Object.fromEntries(data.locations.map(l => [l.id, l]));

    // Calculate current stock from stock_records
    return rules.map(rule => {
      const prod = prodMap[rule.product_id] || {};
      const loc = locMap[rule.location_id] || {};

      let currentStock = 0;
      if (rule.location_id) {
        const match = data.stock_records.find(s => s.product_id === rule.product_id && s.location_id === rule.location_id);
        currentStock = match ? match.quantity : 0;
      } else {
        currentStock = data.stock_records
          .filter(s => s.product_id === rule.product_id)
          .reduce((acc, c) => acc + c.quantity, 0);
      }

      let status = 'adequate';
      if (currentStock <= rule.min_quantity) {
        status = 'breached'; // Below minimum threshold
      } else if (currentStock >= rule.max_quantity) {
        status = 'surplus'; // Overstocked
      }

      return {
        ...rule,
        product_name: prod.name || 'Unknown Item',
        sku: prod.sku || 'N/A',
        unit: prod.unit_of_measure || 'units',
        location_name: loc.full_path || loc.name || 'All Warehouse Locations',
        current_stock: currentStock,
        status
      };
    });
  },

  createReorderRule(payload) {
    const data = loadStore();
    const minQty = Number(payload.min_quantity);
    const maxQty = Number(payload.max_quantity);
    const reorderQty = Number(payload.reorder_quantity);

    if (minQty <= 0) throw new Error('Minimum quantity must be greater than zero.');
    if (maxQty <= minQty) throw new Error(`Maximum quantity (${maxQty}) must exceed minimum quantity (${minQty}).`);
    if (reorderQty <= 0) throw new Error('Reorder quantity must be greater than zero.');

    const newRule = {
      id: Date.now(),
      product_id: Number(payload.product_id),
      location_id: payload.location_id ? Number(payload.location_id) : null,
      min_quantity: minQty,
      max_quantity: maxQty,
      reorder_quantity: reorderQty,
      is_active: true
    };

    data.reorder_rules.push(newRule);
    saveStore(data);
    return newRule;
  },

  deleteReorderRule(ruleId) {
    const data = loadStore();
    data.reorder_rules = data.reorder_rules.filter(r => r.id !== Number(ruleId));
    saveStore(data);
    return true;
  }
};
