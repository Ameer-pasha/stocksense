import { useState, useEffect, useCallback } from 'react';
import { reorderApi } from '../api/reorderApi';

export function useReorderRules(initialFilters = {}) {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRules = useCallback(async (filters = initialFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reorderApi.getReorderRules(filters);
      setRules(data);
    } catch (err) {
      console.error('[useReorderRules] Fetch failed:', err);
      setError(err.message || 'Failed to fetch reorder rules');
    } finally {
      setIsLoading(false);
    }
  }, [initialFilters]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = async (ruleData) => {
    const created = await reorderApi.createReorderRule(ruleData);
    await fetchRules();
    return created;
  };

  const deleteRule = async (id) => {
    await reorderApi.deleteReorderRule(id);
    await fetchRules();
  };

  const breachCount = rules.filter(r => r.status === 'breached').length;

  return {
    rules,
    breachCount,
    isLoading,
    error,
    refreshRules: fetchRules,
    createRule,
    deleteRule
  };
}
