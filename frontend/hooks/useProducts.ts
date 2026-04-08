'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useProducts(params?: Record<string, string>) {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (params?._skip === 'true') {
        setLoading(true);
        return;
      }
      setLoading(true);
      try {
        const query = new URLSearchParams(params || {}).toString();
        const { data } = await api.get(`/products?${query}`);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [JSON.stringify(params)]);

  return { products, pagination, loading };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}

export function useBestSellers(sort?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/best-sellers${sort ? `?sort=${sort}` : ''}`)
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [sort]);

  return { products, loading };
}

export function useNewArrivals(sort?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/new-arrivals${sort ? `?sort=${sort}` : ''}`)
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [sort]);

  return { products, loading };
}

