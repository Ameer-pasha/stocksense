import { useState, useEffect, useCallback } from 'react';
import { locationApi } from '../api/locationApi';

export function useLocations(selectedWarehouseId = null) {
  const [locations, setLocations] = useState([]);
  const [locationTree, setLocationTree] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocations = useCallback(async (whId) => {
    const targetWh = whId || selectedWarehouseId;
    if (!targetWh) {
      setLocations([]);
      setLocationTree([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [list, tree] = await Promise.all([
        locationApi.getLocations(targetWh),
        locationApi.getLocationTree(targetWh)
      ]);
      setLocations(list);
      setLocationTree(tree);
    } catch (err) {
      console.error('[useLocations] Fetch failed:', err);
      setError(err.message || 'Failed to fetch warehouse locations');
    } finally {
      setIsLoading(false);
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchLocations(selectedWarehouseId);
    }
  }, [selectedWarehouseId, fetchLocations]);

  const createLocation = async (locData) => {
    const created = await locationApi.createLocation(locData);
    await fetchLocations(locData.warehouse_id);
    return created;
  };

  const updateLocation = async (id, locData) => {
    const updated = await locationApi.updateLocation(id, locData);
    await fetchLocations(selectedWarehouseId);
    return updated;
  };

  const toggleLocationStatus = async (id, currentStatus) => {
    const res = await locationApi.setLocationStatus(id, !currentStatus);
    await fetchLocations(selectedWarehouseId);
    return res;
  };

  return {
    locations,
    locationTree,
    isLoading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    toggleLocationStatus
  };
}
