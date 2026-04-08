'use client';

import { useState } from 'react';
import { useNewArrivals } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import SectionHeader from '@/components/product/SectionHeader';
import SortDropdown from '@/components/product/SortDropdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewArrivals() {
  const [sort, setSort] = useState('newest');
  const { products, loading } = useNewArrivals(sort);

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-gray-50 py-14 md:py-16">
      <div className="max-w-360 mx-auto px-4">
        <SectionHeader title="New Arrivals" viewAllHref="/shop?sort=newest" />

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? '' : `${products.length} products`}
          </p>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-2">
                  <Skeleton className="w-full h-52 rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-3" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
              ))
            : products.slice(0, 8).map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}
