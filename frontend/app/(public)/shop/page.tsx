'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilter from '@/components/product/ProductFilter';
import SortDropdown from '@/components/product/SortDropdown';
import SectionHeader from '@/components/product/SectionHeader';
import { useProducts } from '@/hooks/useProducts';

export default function ShopPage() {
  const [filters, setFilters] = useState<Record<string, string>>({ sort: 'popular' });
  const [page, setPage] = useState(1);
  const { products, pagination, loading } = useProducts({ ...filters, page: String(page), limit: '4' });

  const handleSortChange = (sort: string) => {
    setFilters({ ...filters, sort });
    setPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-360 mx-auto px-4 py-8">
        {/* Section Title */}
        <SectionHeader title="All Products" />

        {/* Toolbar: Filter + Count + Sort */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {/* Filter Button (opens sheet on all screens) */}
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2 border-gray-300 text-brand-black hover:border-brand-red hover:text-brand-red" />}>
                <SlidersHorizontal size={16} />
                <span className="uppercase text-xs font-bold tracking-wider">Filter</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px] flex flex-col p-0">
                <div className="flex-1 overflow-hidden">
                  <ProductFilter filters={filters} onFilterChange={(f) => { setFilters(f); setPage(1); }} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Product count + pagination info */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
              {pagination.total > 0 && (
                <>
                  <span className="font-medium text-brand-black">
                    {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)}
                  </span>
                  <span>of</span>
                  <span className="font-medium text-brand-black">{pagination.total}</span>
                  <span>products</span>
                </>
              )}
            </div>
          </div>

          {/* Sort Dropdown */}
          <SortDropdown value={filters.sort || 'popular'} onChange={handleSortChange} />
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} loading={loading} />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <nav className="flex items-center justify-center gap-1.5 mt-10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="w-9 h-9 inline-flex items-center justify-center text-gray-400 text-sm">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 inline-flex items-center justify-center rounded text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-brand-red text-white font-bold'
                        : 'border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
