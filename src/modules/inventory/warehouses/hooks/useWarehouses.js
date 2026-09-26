import { useState, useEffect, useCallback } from 'react';
import { warehouseApi } from '../api/warehouseApi';

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarehouses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await warehouseApi.getWarehouses();
      setWarehouses(data);
    } catch (err) {
      console.error('[useWarehouses] Fetch failed:', err);
      setError(err.message || 'Failed to fetch warehouses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const createWarehouse = async (whData) => {
    const created = await warehouseApi.createWarehouse(whData);
    await fetchWarehouses();
    return created;
  };

  const updateWarehouse = async (id, whData) => {
    const updated = await warehouseApi.updateWarehouse(id, whData);
    await fetchWarehouses();
    return updated;
  };

  const toggleWarehouseStatus = async (id, currentStatus) => {
    const res = await warehouseApi.setWarehouseStatus(id, !currentStatus);
    await fetchWarehouses();
    return res;
  };

  return {
    warehouses,
    isLoading,
    error,
    refreshWarehouses: fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    toggleWarehouseStatus
  };
}
