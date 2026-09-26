// Category API Abstraction Layer (Member 2)
import { apiClient } from '../../../shared/services/apiClient';
import { inventoryMockStore } from '../../mock/inventoryMockStore';

export const categoryApi = {
  async getCategories(tree = false) {
    const res = await apiClient.get(`/categories${tree ? '?tree=true' : ''}`);
    if (res) return res;
    return inventoryMockStore.getCategories(tree);
  },

  async createCategory(data) {
    if (!data.name || !data.name.trim()) throw new Error('Category name is required.');
    const res = await apiClient.post('/categories', data);
    if (res) return res;
    return inventoryMockStore.createCategory(data);
  },

  async updateCategory(id, data) {
    const res = await apiClient.put(`/categories/${id}`, data);
    if (res) return res;
    return inventoryMockStore.updateCategory(id, data);
  },

  async setCategoryStatus(id, isActive) {
    const res = await apiClient.put(`/categories/${id}/status`, { is_active: isActive });
    if (res) return res;
    return inventoryMockStore.setCategoryStatus(id, isActive);
  }
};
