'use client';

import { useState, useEffect, use } from 'react';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilter from '@/components/product/ProductFilter';
import SortDropdown from '@/components/product/SortDropdown';
import SectionHeader from '@/components/product/SectionHeader';
import { useProducts } from '@/hooks/useProducts';
import api from '@/lib/api';

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    api.get(`/categories/${category}`)
      .then(({ data }) => {
        setCategoryData(data.category);
        setCategoryId(data.category?._id || 'not-found');
      })
      .catch(() => setCategoryId('not-found'));
  }, [category]);

  const filters: Record<string, string> = { sort, page: String(page) };
  if (categoryId && categoryId !== 'not-found') filters.category = categoryId;
  else if (categoryId === 'not-found') filters.category = 'invalid-id-to-force-empty';

  // Only fetch products if categoryId is resolved (so we don't fetch all products on initial render)
  // useProducts automatically fetches, so we pass a dummy 'prevent_fetch' if needed, OR we can just add that feature.
  // Actually, 'invalid-id-to-force-empty' will return 0 products, which is fine! 
  // Wait, if categoryId is null, we can pass a dummy params that we modify useProducts to ignore. 
  // Let's just use a special key '_skip: "true"'.
  
  const finalFilters = categoryId === null ? { _skip: 'true' } : filters;
  const { products, pagination, loading } = useProducts(finalFilters);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-360 mx-auto px-4 py-8">
        <SectionHeader title={categoryData?.name || 'Category'} />

        {categoryData?.description && (
          <p className="text-gray-500 mb-6 -mt-4">{categoryData.description}</p>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2 border-gray-300 text-brand-black hover:border-brand-red hover:text-brand-red" />}>
                <SlidersHorizontal size={16} />
                <span className="uppercase text-xs font-bold tracking-wider">Filter</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px] flex flex-col p-0">
                <div className="flex-1 overflow-hidden">
                  <ProductFilter
                    filters={{ ...filters, sort }}
                    onFilterChange={(f) => { setSort(f.sort || 'popular'); setPage(1); }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <span className="hidden sm:inline text-sm text-gray-500">
              {pagination.total} products
            </span>
          </div>

          <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
        </div>

        <ProductGrid products={products} loading={loading} />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <nav className="flex items-center justify-center gap-1.5 mt-10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-brand-red text-white font-bold'
                    : 'border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
