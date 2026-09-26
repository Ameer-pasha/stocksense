// StockSense - useAdjustments Custom Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { adjustmentService } from '../services/adjustmentService';

export function useAdjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterReason, setFilterReason] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdjustments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adjustmentService.getAdjustments();
      setAdjustments(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch stock adjustments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdjustments();

    const handleUpdate = (e) => {
      if (e.detail) setAdjustments(e.detail);
      else loadAdjustments();
    };

    window.addEventListener('stocksense:adjustments_updated', handleUpdate);
    return () => window.removeEventListener('stocksense:adjustments_updated', handleUpdate);
  }, [loadAdjustments]);

  // Filtered adjustments
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        item.id.toLowerCase().includes(q) || 
        item.productName.toLowerCase().includes(q) || 
        item.sku.toLowerCase().includes(q);

      const matchesReason = filterReason === 'ALL' || item.reason === filterReason;

      return matchesQuery && matchesReason;
    });
  }, [adjustments, searchQuery, filterReason]);

  const submitAdjustment = async (adjustmentData) => {
    const record = await adjustmentService.recordAdjustment(adjustmentData);
    setAdjustments(prev => [record, ...prev]);
    return record;
  };

  return {
    adjustments,
    filteredAdjustments,
    loading,
    error,
    filterReason,
    setFilterReason,
    searchQuery,
    setSearchQuery,
    submitAdjustment,
    refreshAdjustments: loadAdjustments
  };
}
