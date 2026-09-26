import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';

export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (customFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters = customFilters !== undefined ? customFilters : filters;
      const data = await productApi.getProducts(activeFilters);
      setProducts(data);
    } catch (err) {
      console.error('[useProducts] Fetch failed:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
  };

  const createProduct = async (productData) => {
    const created = await productApi.createProduct(productData);
    await fetchProducts();
    return created;
  };

  const updateProduct = async (id, productData) => {
    const updated = await productApi.updateProduct(id, productData);
    await fetchProducts();
    return updated;
  };

  const toggleProductStatus = async (id, currentStatus) => {
    const res = await productApi.setProductStatus(id, !currentStatus);
    await fetchProducts();
    return res;
  };

  const getAvailability = async (id) => {
    return await productApi.getProductAvailability(id);
  };

  // Derived statistics for product cards
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    inactiveProducts: products.filter(p => !p.is_active).length,
    totalStockUnits: products.reduce((acc, p) => acc + (p.total_available_stock || 0), 0)
  };

  return {
    products,
    stats,
    isLoading,
    error,
    filters,
    updateFilters,
    refreshProducts: fetchProducts,
    createProduct,
    updateProduct,
    toggleProductStatus,
    getAvailability
  };
}
