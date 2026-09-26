// StockSense - useProducts Custom Hook
// Encapsulates all Product business logic, filters, calculations, and mutations

import { useState, useEffect, useMemo, useCallback } from 'react';
import { productService } from '../services/productService';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'sku', 'stock', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();

    // Listen to external product updates (e.g. from Stock Adjustments or Receipts)
    const handleUpdate = (e) => {
      if (e.detail) setProducts(e.detail);
      else loadProducts();
    };

    window.addEventListener('stocksense:products_updated', handleUpdate);
    return () => window.removeEventListener('stocksense:products_updated', handleUpdate);
  }, [loadProducts]);

  // Compute KPI statistics (shared with Faizan's Dashboard)
  const stats = useMemo(() => {
    const totalProducts = products.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      if (p.totalStock === 0) {
        outOfStockCount++;
      } else if (p.totalStock <= p.minStockThreshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    return {
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      lowStockList: products.filter(p => p.totalStock <= p.minStockThreshold)
    };
  }, [products]);

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search by name or SKU
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);

        // Category filter
        const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;

        // Low stock filter toggle
        const matchesLowStock = !onlyLowStock || p.totalStock <= p.minStockThreshold;

        // Location filter
        const matchesLoc = selectedLocation === 'ALL' || p.locations.some(l => l.warehouseId === selectedLocation);

        return matchesQuery && matchesCat && matchesLowStock && matchesLoc;
      })
      .sort((a, b) => {
        let valA, valB;
        if (sortBy === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === 'sku') {
          valA = a.sku.toLowerCase();
          valB = b.sku.toLowerCase();
        } else if (sortBy === 'stock') {
          valA = a.totalStock;
          valB = b.totalStock;
        } else {
          valA = a.category;
          valB = b.category;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, onlyLowStock, selectedLocation, sortBy, sortOrder]);

  const addProduct = async (productData) => {
    const created = await productService.createProduct(productData);
    setProducts(prev => [created, ...prev.filter(p => p.id !== created.id)]);
    return created;
  };

  const editProduct = async (id, updatedFields) => {
    const updated = await productService.updateProduct(id, updatedFields);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const removeProduct = async (id) => {
    await productService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    filteredProducts,
    loading,
    error,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    onlyLowStock,
    setOnlyLowStock,
    selectedLocation,
    setSelectedLocation,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addProduct,
    editProduct,
    removeProduct,
    refreshProducts: loadProducts
  };
}
