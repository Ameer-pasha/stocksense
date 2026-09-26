// StockSense - Product Service (Modular & Pluggable)
// Integrates with Prince's Backend API (/api/products) with automatic fallback to reactive localStorage

import { apiClient } from '../../shared/services/apiClient';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const STORAGE_KEY = 'stocksense_products_data';

function normalizeProduct(p) {
  if (!p) return null;
  const id = p.id || p._id || `prod-${Date.now()}`;
  const totalStock = p.totalStock !== undefined 
    ? Number(p.totalStock) 
    : (p.stock !== undefined ? Number(p.stock) : (p.quantity !== undefined ? Number(p.quantity) : 0));

  let locations = Array.isArray(p.locations) && p.locations.length > 0 
    ? p.locations.map(loc => ({
        warehouseId: loc.warehouseId || loc.warehouse_id || 'wh-main',
        warehouseName: loc.warehouseName || loc.warehouse_name || 'Main Warehouse',
        locationCode: loc.locationCode || loc.location_code || 'Rack A',
        quantity: Number(loc.quantity) || 0
      }))
    : [{
        warehouseId: 'wh-main',
        warehouseName: 'Main Warehouse',
        locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
        quantity: totalStock
      }];

  return {
    id: String(id),
    name: p.name || 'Unnamed Product',
    sku: (p.sku || '').toUpperCase(),
    category: p.category || (p.category_name || 'General'),
    unitOfMeasure: p.unitOfMeasure || p.unit_of_measure || p.unit || 'pcs',
    minStockThreshold: Number(p.minStockThreshold ?? p.min_quantity ?? p.minQuantity ?? 10),
    totalStock: locations.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0),
    locations: locations,
    costPrice: Number(p.costPrice || p.cost_price || 0),
    sellingPrice: Number(p.sellingPrice || p.selling_price || 0),
    status: p.status || (p.is_active === false ? 'Inactive' : 'Active'),
    createdAt: p.createdAt || p.created_at || new Date().toISOString(),
    updatedAt: p.updatedAt || p.updated_at || new Date().toISOString()
  };
}

export const productService = {
  // Get all products from Backend API (/api/products)
  async getProducts() {
    // 1. Try real API from backend
    const backendRes = await apiClient.get('/products');
    const items = Array.isArray(backendRes) 
      ? backendRes 
      : (backendRes?.data || backendRes?.products || backendRes?.items);

    if (items && Array.isArray(items)) {
      const normalizedList = items.map(normalizeProduct);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedList));
      return normalizedList;
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local).map(normalizeProduct);
      } catch (e) {
        console.error('Error parsing stored products', e);
      }
    }

    // 3. Fallback to initial seeds
    const seeds = INITIAL_PRODUCTS.map(normalizeProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  },

  // Save full products array to cache / storage
  _saveLocal(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('stocksense:products_updated', { detail: products }));
  },

  // Get product by ID
  async getProductById(id) {
    const backendRes = await apiClient.get(`/products/${id}`);
    const item = backendRes?.data || backendRes?.product || backendRes;
    if (item && item.name) {
      return normalizeProduct(item);
    }
    const products = await this.getProducts();
    return products.find(p => String(p.id) === String(id)) || null;
  },

  // Create new product via POST /api/products
  async createProduct(newProduct) {
    const products = await this.getProducts();
    const cleanSku = newProduct.sku.trim().toUpperCase();

    // Check SKU collision locally
    const existingSku = products.find(p => p.sku.toUpperCase() === cleanSku);
    if (existingSku) {
      throw new Error(`A product with SKU "${cleanSku}" already exists.`);
    }

    const locations = newProduct.locations && newProduct.locations.length > 0 
      ? newProduct.locations 
      : [{
          warehouseId: newProduct.initialWarehouseId || 'wh-main',
          warehouseName: newProduct.initialWarehouseName || 'Main Warehouse',
          locationCode: newProduct.initialLocationCode || 'Rack A (Bulk Steel & Heavy Goods)',
          quantity: Number(newProduct.initialStock) || 0
        }];

    const totalStock = locations.reduce((sum, loc) => sum + (Number(loc.quantity) || 0), 0);

    const productRecord = {
      id: `prod-${Date.now().toString().slice(-5)}`,
      name: newProduct.name.trim(),
      sku: cleanSku,
      category: newProduct.category || 'General',
      unitOfMeasure: newProduct.unitOfMeasure || 'pcs',
      minStockThreshold: Number(newProduct.minStockThreshold) || 10,
      totalStock: totalStock,
      locations: locations,
      costPrice: Number(newProduct.costPrice) || 0,
      sellingPrice: Number(newProduct.sellingPrice) || 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Try backend POST /api/products
    const backendResult = await apiClient.post('/products', productRecord);
    const created = backendResult?.data || backendResult?.product || backendResult;
    const finalRecord = created && created.name ? normalizeProduct(created) : productRecord;

    const updatedList = [finalRecord, ...products];
    this._saveLocal(updatedList);
    return finalRecord;
  },

  // Update product details via PUT /api/products/:id
  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index === -1) throw new Error(`Product with ID ${id} not found.`);

    // Check SKU collision
    if (updatedFields.sku) {
      const cleanSku = updatedFields.sku.trim().toUpperCase();
      const collision = products.find(p => String(p.id) !== String(id) && p.sku.toUpperCase() === cleanSku);
      if (collision) {
        throw new Error(`Another product already uses SKU "${cleanSku}".`);
      }
    }

    const current = products[index];
    const updated = {
      ...current,
      ...updatedFields,
      sku: updatedFields.sku ? updatedFields.sku.trim().toUpperCase() : current.sku,
      minStockThreshold: updatedFields.minStockThreshold !== undefined ? Number(updatedFields.minStockThreshold) : current.minStockThreshold,
      updatedAt: new Date().toISOString()
    };

    if (updated.locations) {
      updated.totalStock = updated.locations.reduce((sum, loc) => sum + (Number(loc.quantity) || 0), 0);
    }

    // Try backend PUT /api/products/:id
    const backendResult = await apiClient.put(`/products/${id}`, updated);
    const saved = backendResult?.data || backendResult?.product || backendResult;
    const finalRecord = saved && saved.name ? normalizeProduct(saved) : updated;

    products[index] = finalRecord;
    this._saveLocal(products);
    return finalRecord;
  },

  // Delete product via DELETE /api/products/:id
  async deleteProduct(id) {
    const products = await this.getProducts();
    const filtered = products.filter(p => String(p.id) !== String(id));
    
    // Call backend DELETE
    await apiClient.delete(`/products/${id}`);
    
    this._saveLocal(filtered);
    return true;
  },

  // Adjust stock in specific location (used by Stock Adjustment module)
  async applyLocationAdjustment(productId, locationCode, newQuantity) {
    const products = await this.getProducts();
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) throw new Error('Product not found for adjustment.');

    let foundLocation = false;
    product.locations = product.locations.map(loc => {
      if (loc.locationCode === locationCode) {
        foundLocation = true;
        return { ...loc, quantity: Math.max(0, Number(newQuantity)) };
      }
      return loc;
    });

    if (!foundLocation) {
      product.locations.push({
        warehouseId: 'wh-main',
        warehouseName: 'Main Warehouse',
        locationCode: locationCode,
        quantity: Math.max(0, Number(newQuantity))
      });
    }

    product.totalStock = product.locations.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
    product.updatedAt = new Date().toISOString();

    // Sync with backend if available
    await apiClient.put(`/products/${productId}`, product);

    this._saveLocal(products);
    return product;
  }
};
