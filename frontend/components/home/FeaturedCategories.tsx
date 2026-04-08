'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import SectionHeader from '@/components/product/SectionHeader';
import api from '@/lib/api';

import { Car, Bike, Cpu, Wrench, Sparkles, Lightbulb } from 'lucide-react';

const iconMap: Record<string, any> = {
  'car-accessories': Car,
  'bike-accessories': Bike,
  'electronics': Cpu,
  'tools-equipment': Wrench,
  'car-care': Sparkles,
  'lighting': Lightbulb,
};

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);


  return (
    <section className="max-w-360 mx-auto px-4 py-14 md:py-16">
      <SectionHeader title="Top Categories" />

      {/* Scrollable Category Row */}
      <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-4 px-1">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0">
                <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full" />
                <Skeleton className="h-3 w-16 mt-2" />
              </div>
            ))
          : categories.map((cat, idx) => {
              const Icon = iconMap[cat.slug] || Car;
              return (
                <Link
                  key={cat._id}
                  href={`/shop/${cat.slug}`}
                  className="flex flex-col items-center flex-shrink-0 group"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] border-gray-200 group-hover:border-brand-red transition-colors duration-300 bg-gray-50 flex items-center justify-center">
                    {cat.image?.url ? (
                      <Image
                        src={cat.image.url}
                        alt={cat.name}
                        width={96}
                        height={96}
                        priority={idx < 4}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                    ) : (
                      <Icon size={32} className="text-gray-400 group-hover:text-brand-red transition-colors duration-300" />
                    )}
                  </div>
                  <span className="mt-2 text-xs md:text-sm font-semibold text-gray-700 group-hover:text-brand-red transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
