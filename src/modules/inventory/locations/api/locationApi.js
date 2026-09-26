// Location API Abstraction Layer (Member 2)
import { apiClient } from '../../../shared/services/apiClient';
import { inventoryMockStore } from '../../mock/inventoryMockStore';

export const locationApi = {
  async getLocations(warehouseId = null) {
    const res = await apiClient.get(`/locations${warehouseId ? `?warehouse_id=${warehouseId}` : ''}`);
    if (res) return res;
    return inventoryMockStore.getLocations(warehouseId);
  },

  async getLocationTree(warehouseId) {
    const res = await apiClient.get(`/warehouses/${warehouseId}/locations`);
    if (res) return res;
    return inventoryMockStore.getLocationTree(warehouseId);
  },

  async createLocation(data) {
    if (!data.warehouse_id) throw new Error('Warehouse is required.');
    if (!data.name || !data.name.trim()) throw new Error('Location name is required.');
    if (!data.code || !data.code.trim()) throw new Error('Location code is required.');

    const res = await apiClient.post('/locations', data);
    if (res) return res;
    return inventoryMockStore.createLocation(data);
  },

  async updateLocation(id, data) {
    const res = await apiClient.put(`/locations/${id}`, data);
    if (res) return res;
    return inventoryMockStore.updateLocation(id, data);
  },

  async setLocationStatus(id, isActive) {
    const res = await apiClient.put(`/locations/${id}/status`, { is_active: isActive });
    if (res) return res;
    return inventoryMockStore.setLocationStatus(id, isActive);
  }
};
