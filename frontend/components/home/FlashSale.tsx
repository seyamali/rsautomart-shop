'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';
import api from '@/lib/api';

export default function FlashSale() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setProducts(data.products?.slice(0, 4) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-linear-to-r from-brand-red to-red-700 py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3 text-white">
            <Zap size={28} className="fill-yellow-300 text-yellow-300" />
            <h2 className="text-2xl font-bold">Flash Sale</h2>
          </div>
          <div className="flex items-center gap-2">
            {['hours', 'minutes', 'seconds'].map((unit, i) => (
              <div key={unit} className="flex items-center gap-2">
                <div className="bg-white text-red-600 rounded-lg px-3 py-2 min-w-[3rem] text-center">
                  <span className="text-xl font-bold">
                    {String(timeLeft[unit as keyof typeof timeLeft]).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] uppercase">{unit}</p>
                </div>
                {i < 2 && <span className="text-white text-xl font-bold">:</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-2">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-3" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
              ))
            : products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}
