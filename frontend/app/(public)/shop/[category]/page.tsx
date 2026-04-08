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

  const filters: Record<string, string> = { sort, page: String(page), limit: '12' };
  if (categoryId && categoryId !== 'not-found') filters.category = categoryId;
  else if (categoryId === 'not-found') filters.category = 'invalid-id-to-force-empty';

  const finalFilters = categoryId === null ? { _skip: 'true' } : filters;
  const { products, pagination, loading } = useProducts(finalFilters);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-360 mx-auto px-4 py-8">
        <SectionHeader title={categoryData?.name || 'Category'} />

        {categoryData?.description && (
          <p className="text-gray-500 mb-6 -mt-4 text-sm font-medium border-l-2 border-brand-red pl-4">{categoryData.description}</p>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2 border-gray-300 text-brand-black hover:border-brand-red hover:text-brand-red transition-all" />}>
                <SlidersHorizontal size={16} />
                <span className="uppercase text-xs font-bold tracking-wider">Filter</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px] flex flex-col p-0">
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
                  <ProductFilter
                    filters={{ ...filters, sort }}
                    onFilterChange={(f) => { setSort(f.sort || 'popular'); setPage(1); }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <span className="hidden sm:inline text-sm text-gray-400 font-bold uppercase tracking-tighter">
              {pagination.total} components found
            </span>
          </div>

          <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
        </div>

        <ProductGrid products={products} loading={loading} />

        {/* Pagination Overlay (Windowed) */}
        {pagination.pages > 1 && (
          <nav className="flex items-center justify-center gap-1.5 mt-12 pb-10">
            <button
              onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo(0,0); }}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red transition-all disabled:opacity-30 bg-white shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1.5">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="w-10 h-10 inline-flex items-center justify-center text-gray-400 text-sm font-bold tracking-widest">...</span>
                  )}
                  <button
                    onClick={() => { setPage(p); window.scrollTo(0,0); }}
                    className={`w-10 h-10 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${
                      p === page
                        ? 'bg-brand-red text-white scale-110'
                        : 'bg-white border border-gray-100 text-gray-600 hover:border-brand-red hover:text-brand-red'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}

            <button
              onClick={() => { setPage(Math.min(pagination.pages, page + 1)); window.scrollTo(0,0); }}
              disabled={page === pagination.pages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red transition-all disabled:opacity-30 bg-white shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
