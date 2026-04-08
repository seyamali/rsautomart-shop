'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import api from '@/lib/api';


interface ProductFilterProps {
  filters: Record<string, string>;
  onFilterChange: (filters: Record<string, string>) => void;
}

export default function ProductFilter({ filters, onFilterChange }: ProductFilterProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => setCategories([]));
  }, []);


  const applyPriceFilter = () => {
    onFilterChange({ ...filters, minPrice, maxPrice });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({ sort: filters.sort || 'popular' });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.brand;

  return (
    <div className="flex flex-col h-full space-y-8 overflow-y-auto pb-24 px-4 pt-8 scrollbar-custom">
      {/* Header */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="font-extrabold text-2xl uppercase tracking-widest text-brand-black">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-brand-red font-bold flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-100 w-full py-2 rounded-md transition-colors"
          >
            <X size={14} className="stroke-[3]" /> Clear All Active Filters
          </button>
        )}
      </div>

      <Separator className="bg-gray-200" />

      {/* Categories */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-brand-black mb-3 relative pb-2">
          Categories
          <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red rounded" />
        </h4>
        <div className="space-y-1">
          <button
            className={`block text-sm w-full text-left px-3 py-2 rounded transition-colors ${
              !filters.category
                ? 'bg-brand-red text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red hover:pl-4 transition-all duration-200'
            }`}
            onClick={() => {
              const { category, ...rest } = filters;
              onFilterChange(rest);
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`block text-sm w-full text-left px-3 py-2 rounded transition-all duration-200 ${
                filters.category === cat._id
                  ? 'bg-brand-red text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red hover:pl-4'
              }`}
              onClick={() => onFilterChange({ ...filters, category: cat._id })}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-brand-black mb-3 relative pb-2">
          Price Range (৳)
          <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red rounded" />
        </h4>

        <div className="flex items-center justify-between text-sm font-semibold text-brand-black mb-3">
          <span>৳{minPrice || 0}</span>
          <span>৳{maxPrice || 10000}</span>
        </div>

        <div className="relative h-6">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-brand-red rounded-full"
            style={{
              left: `${((Number(minPrice) || 0) / 10000) * 100}%`,
              right: `${100 - ((Number(maxPrice) || 10000) / 10000) * 100}%`,
            }}
          />
          <input
            type="range"
            min={0}
            max={10000}
            step={50}
            value={Number(minPrice) || 0}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), Number(maxPrice) || 10000);
              setMinPrice(String(v));
            }}
            className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
          />
          <input
            type="range"
            min={0}
            max={10000}
            step={50}
            value={Number(maxPrice) || 10000}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), Number(minPrice) || 0);
              setMaxPrice(String(v));
            }}
            className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
          />
        </div>

        <Button
          size="sm"
          className="mt-4 w-full bg-brand-black hover:bg-brand-red text-white text-xs uppercase tracking-wider font-bold min-h-11"
          onClick={applyPriceFilter}
        >
          Apply Price Filter
        </Button>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-brand-black mb-3 relative pb-2">
          Availability
          <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red rounded" />
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand-red transition-colors">
            <input type="checkbox" className="rounded border-gray-300 text-brand-red focus:ring-brand-red" />
            In Stock
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand-red transition-colors">
            <input type="checkbox" className="rounded border-gray-300 text-brand-red focus:ring-brand-red" />
            On Sale
          </label>
        </div>
      </div>
    </div>
  );
}
