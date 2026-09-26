import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../api/categoryApi';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [flatList, treeList] = await Promise.all([
        categoryApi.getCategories(false),
        categoryApi.getCategories(true)
      ]);
      setCategories(flatList);
      setCategoryTree(treeList);
    } catch (err) {
      console.error('[useCategories] Fetch failed:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (catData) => {
    const created = await categoryApi.createCategory(catData);
    await fetchCategories();
    return created;
  };

  const updateCategory = async (id, catData) => {
    const updated = await categoryApi.updateCategory(id, catData);
    await fetchCategories();
    return updated;
  };

  const toggleCategoryStatus = async (id, currentStatus) => {
    const res = await categoryApi.setCategoryStatus(id, !currentStatus);
    await fetchCategories();
    return res;
  };

  return {
    categories,
    categoryTree,
    isLoading,
    error,
    refreshCategories: fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus
  };
}
