// Warehouse API Abstraction Layer (Member 2)
import { apiClient } from '../../../shared/services/apiClient';
import { inventoryMockStore } from '../../mock/inventoryMockStore';

export const warehouseApi = {
  async getWarehouses() {
    const res = await apiClient.get('/warehouses');
    if (res) return res;
    return inventoryMockStore.getWarehouses();
  },

  async getWarehouseById(id) {
    const res = await apiClient.get(`/warehouses/${id}`);
    if (res) return res;
    return inventoryMockStore.getWarehouseById(id);
  },

  async createWarehouse(data) {
    if (!data.name || !data.name.trim()) throw new Error('Warehouse name is required.');
    if (!data.code || !data.code.trim()) throw new Error('Warehouse code is required.');
    const res = await apiClient.post('/warehouses', data);
    if (res) return res;
    return inventoryMockStore.createWarehouse(data);
  },

  async updateWarehouse(id, data) {
    const res = await apiClient.put(`/warehouses/${id}`, data);
    if (res) return res;
    return inventoryMockStore.updateWarehouse(id, data);
  },

  async setWarehouseStatus(id, isActive) {
    const res = await apiClient.put(`/warehouses/${id}/status`, { is_active: isActive });
    if (res) return res;
    return inventoryMockStore.setWarehouseStatus(id, isActive);
  }
};
