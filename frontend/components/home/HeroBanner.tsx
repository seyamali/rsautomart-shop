'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const banners = [
  {
    badge: 'Limited Time Offer',
    title: 'MEGA AUTO\nPARTS SALE',
    subtitle: 'Premium quality parts for every make & model. Free shipping on orders over ৳999.',
    cta: 'Shop Now',
    href: '/shop',
    bg: 'from-brand-black/70 via-transparent to-brand-black/30',
    img: 'https://placehold.co/1400x450/1a1a1a/cc0000?text=RS+AUTOMART+–+MEGA+SALE+UP+TO+50%25+OFF',
  },
  {
    badge: 'Flash Sale',
    title: 'UP TO 50%\nOFF TODAY',
    subtitle: 'Limited time deals on best-selling car & bike accessories.',
    cta: 'View Deals',
    href: '/offers',
    bg: 'from-brand-red/80 via-transparent to-brand-black/40',
    img: 'https://placehold.co/1400x450/cc0000/ffffff?text=FLASH+SALE+–+50%25+OFF',
  },
  {
    badge: 'Free Delivery',
    title: 'FREE SHIPPING\nON ৳999+',
    subtitle: 'Shop more, save more. Premium accessories delivered to your doorstep.',
    cta: 'Start Shopping',
    href: '/shop',
    bg: 'from-brand-black/80 via-brand-black/30 to-transparent',
    img: 'https://placehold.co/1400x450/111111/cc0000?text=FREE+DELIVERY+ON+৳999%2B',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-360 mx-auto px-4 py-4">
      <div className="relative overflow-hidden rounded-lg group cursor-pointer" style={{ height: 'clamp(220px, 40vw, 450px)' }}>
        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, i) => (
            <div key={i} className="w-full flex-shrink-0 relative h-full">
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={banner.img}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Overlay Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg}`} />
              {/* Text Content */}
              <div className="relative z-10 h-full flex items-center max-w-360 mx-auto px-6">
                <div>
                  <span className="inline-block bg-brand-red text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-3">
                    {banner.badge}
                  </span>
                  <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight whitespace-pre-line">
                    {banner.title}
                  </h2>
                  <p className="text-gray-300 text-sm md:text-base mt-2 max-w-sm">
                    {banner.subtitle}
                  </p>
                  <Link
                    href={banner.href}
                    className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs md:text-sm font-bold uppercase tracking-wider px-6 py-3 mt-5 rounded transition-colors"
                  >
                    {banner.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Left / Right Arrows (show on hover) */}
        <button
          onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
          className="absolute top-1/2 left-3 -translate-y-1/2 w-11 h-11 bg-white/80 hover:bg-brand-red text-brand-black hover:text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 backdrop-blur-sm md:opacity-70 md:group-hover:opacity-100"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % banners.length)}
          className="absolute top-1/2 right-3 -translate-y-1/2 w-11 h-11 bg-white/80 hover:bg-brand-red text-brand-black hover:text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 backdrop-blur-sm md:opacity-70 md:group-hover:opacity-100"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                i === current ? 'w-7 bg-white' : 'w-3 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
