// Product API Abstraction Layer (Member 2)
// Consumes backend REST API if available, falls back seamlessly to inventoryMockStore.
import { apiClient } from '../../../shared/services/apiClient';
import { inventoryMockStore } from '../../mock/inventoryMockStore';

export const productApi = {
  async getProducts(filters = {}) {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.category_id) query.append('category_id', filters.category_id);
    if (filters.warehouse_id) query.append('warehouse_id', filters.warehouse_id);
    if (filters.is_active !== undefined) query.append('is_active', filters.is_active);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get(`/products${qs}`);
    if (res && res.items) return res.items;

    // Local / Mock store execution
    return inventoryMockStore.getProducts(filters);
  },

  async getProductById(id) {
    const res = await apiClient.get(`/products/${id}`);
    if (res) return res;
    return inventoryMockStore.getProductById(id);
  },

  async createProduct(data) {
    // Validate required fields before network call
    if (!data.name || !data.name.trim()) throw new Error('Product name is required.');
    if (!data.sku || !data.sku.trim()) throw new Error('SKU code is required.');
    if (!data.category_id) throw new Error('Category must be selected.');
    if (!data.unit_of_measure) throw new Error('Unit of measure is required.');

    const res = await apiClient.post('/products', data);
    if (res) return res;
    return inventoryMockStore.createProduct(data);
  },

  async updateProduct(id, data) {
    const res = await apiClient.put(`/products/${id}`, data);
    if (res) return res;
    return inventoryMockStore.updateProduct(id, data);
  },

  async setProductStatus(id, isActive) {
    const res = await apiClient.put(`/products/${id}/status`, { is_active: isActive });
    if (res) return res;
    return inventoryMockStore.setProductStatus(id, isActive);
  },

  async getProductAvailability(id) {
    const res = await apiClient.get(`/products/${id}/availability`);
    if (res) return res;
    return inventoryMockStore.getProductAvailability(id);
  }
};
