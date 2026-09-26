// Reorder Rules API Abstraction Layer (Member 2)
import { apiClient } from '../../../shared/services/apiClient';
import { inventoryMockStore } from '../../mock/inventoryMockStore';

export const reorderApi = {
  async getReorderRules(filters = {}) {
    const res = await apiClient.get('/reorder-rules');
    if (res) return res;
    return inventoryMockStore.getReorderRules(filters);
  },

  async createReorderRule(data) {
    if (!data.product_id) throw new Error('Product is required.');
    const min = Number(data.min_quantity);
    const max = Number(data.max_quantity);
    if (min <= 0) throw new Error('Min quantity must be > 0.');
    if (max <= min) throw new Error('Max quantity must be greater than min quantity.');

    const res = await apiClient.post('/reorder-rules', data);
    if (res) return res;
    return inventoryMockStore.createReorderRule(data);
  },

  async deleteReorderRule(id) {
    const res = await apiClient.delete(`/reorder-rules/${id}`);
    if (res) return true;
    return inventoryMockStore.deleteReorderRule(id);
  }
};
