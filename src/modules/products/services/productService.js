// StockSense - Product Service (Modular & Pluggable)
// Integrates with Prince's backend API with automatic fallback to reactive localStorage

import { apiClient } from '../../shared/services/apiClient';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const STORAGE_KEY = 'stocksense_products_data';

export const productService = {
  // Get all products
  async getProducts() {
    // 1. Try real API from Prince if backend is connected
    const backendData = await apiClient.get('/products');
    if (backendData && Array.isArray(backendData)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backendData));
      return backendData;
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing stored products', e);
      }
    }

    // 3. Fallback to initial seeds
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  // Save full products array to cache / storage
  _saveLocal(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('stocksense:products_updated', { detail: products }));
  },

  // Get product by ID
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  // Create new product
  async createProduct(newProduct) {
    // Validate uniqueness of SKU
    const products = await this.getProducts();
    const existingSku = products.find(p => p.sku.toLowerCase() === newProduct.sku.trim().toLowerCase());
    if (existingSku) {
      throw new Error(`A product with SKU "${newProduct.sku}" already exists.`);
    }

    // Compute initial total stock from locations
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
      sku: newProduct.sku.trim().toUpperCase(),
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

    // Try backend POST first
    const backendResult = await apiClient.post('/products', productRecord);
    if (backendResult) {
      products.unshift(backendResult);
      this._saveLocal(products);
      return backendResult;
    }

    // Save locally
    const updatedList = [productRecord, ...products];
    this._saveLocal(updatedList);
    return productRecord;
  },

  // Update product details
  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Product with ID ${id} not found.`);

    // Check SKU collision if SKU changed
    if (updatedFields.sku) {
      const collision = products.find(p => p.id !== id && p.sku.toLowerCase() === updatedFields.sku.trim().toLowerCase());
      if (collision) {
        throw new Error(`Another product already uses SKU "${updatedFields.sku}".`);
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

    // Recalculate total stock if locations updated
    if (updated.locations) {
      updated.totalStock = updated.locations.reduce((sum, loc) => sum + (Number(loc.quantity) || 0), 0);
    }

    // Try backend PUT
    const backendResult = await apiClient.put(`/products/${id}`, updated);
    if (backendResult) {
      products[index] = backendResult;
      this._saveLocal(products);
      return backendResult;
    }

    products[index] = updated;
    this._saveLocal(products);
    return updated;
  },

  // Delete product
  async deleteProduct(id) {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    
    // Try backend DELETE
    await apiClient.delete(`/products/${id}`);
    
    this._saveLocal(filtered);
    return true;
  },

  // Adjust stock in specific location (used by Stock Adjustment module)
  async applyLocationAdjustment(productId, locationCode, newQuantity) {
    const products = await this.getProducts();
    const product = products.find(p => p.id === productId);
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

    // Recompute total stock
    product.totalStock = product.locations.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
    product.updatedAt = new Date().toISOString();

    this._saveLocal(products);
    return product;
  }
};
