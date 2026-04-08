'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';

export default function CategoryBar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (!hasScrolled && el.scrollLeft > 5) setHasScrolled(true);
    setIsAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 10);
  };

  if (categories.length === 0) return null;

  return (
    <div className="bg-brand-black z-40 border-b border-white/5 w-full relative">
      <div className="max-w-360 mx-auto relative lg:px-4">
        {/* Scroll hint arrow — only on mobile, disappears after first scroll */}
        {!hasScrolled && !isAtEnd && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pointer-events-none lg:hidden">
            <div className="h-full flex items-center pr-1 pl-8 bg-gradient-to-l from-brand-black via-brand-black/90 to-transparent">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center animate-bounce">
                <ChevronRight size={14} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Right fade hint for scrollability */}
        {!isAtEnd && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-stretch overflow-x-auto scrollbar-hide"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Link
            href="/shop"
            className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-5 py-3.5 transition-colors flex-shrink-0 group
              ${pathname === '/shop' ? 'bg-brand-red text-white font-black hover:bg-red-700' : 'text-gray-400 hover:text-white hover:bg-white/5 font-bold border-r border-white/5'}`}
          >
            <span className="flex flex-col gap-[3px] w-3.5">
              <span className={`h-px w-full block transition-all ${pathname === '/shop' ? 'bg-white' : 'bg-gray-400 group-hover:bg-white'}`} />
              <span className={`h-px w-2/3 block transition-all ${pathname === '/shop' ? 'bg-white' : 'bg-gray-400 group-hover:bg-white'}`} />
              <span className={`h-px w-full block transition-all ${pathname === '/shop' ? 'bg-white' : 'bg-gray-400 group-hover:bg-white'}`} />
            </span>
            <span className="whitespace-nowrap">All Categories</span>
          </Link>

          {categories.map((cat, i) => {
            const isActive = pathname === `/shop/${cat.slug}`;
            return (
              <Link
                key={cat._id}
                href={`/shop/${cat.slug}`}
                className={`text-[10px] sm:text-xs uppercase tracking-wider px-4 py-3.5 flex-shrink-0 whitespace-nowrap transition-colors border-l border-white/5
                  ${isActive ? 'bg-brand-red text-white font-black hover:bg-red-700' : 
                    `font-bold ${i === 2 && !hasScrolled ? 'text-gray-500 hover:text-white hover:bg-white/5 lg:text-gray-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                  }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
