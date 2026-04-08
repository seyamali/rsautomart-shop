import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Banknote } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-gray-400 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-360 mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Brand */}
        <div>
          <Image 
            src="/logo-small.png" 
            alt="RS Automart" 
            width={160} 
            height={50} 
            className="h-10 w-auto mb-4 invert brightness-110" 
          />
          <p className="text-sm leading-relaxed text-gray-400">
            Your one-stop destination for premium quality auto parts and accessories. We deliver reliability, performance, and value — straight to your doorstep.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[
              { label: 'Facebook', href: 'https://www.facebook.com/rsautomartshop', svg: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
              { label: 'Instagram', href: 'https://www.instagram.com/rsautomartshop', svg: 'M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm4.5-7.5a1 1 0 110-2 1 1 0 010 2z' },
            ].map(({ label, href, svg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-red hover:text-white transition-all duration-300 border border-white/5 hover:border-brand-red shadow-sm group"
                title={label}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={svg} /></svg>
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6 relative pb-2 group">
            Explore
            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red rounded transition-all group-hover:w-12" />
          </h4>
          <ul className="space-y-3">
            {[
              { href: '/profile', label: 'My Member Panel' },
              { href: '/cart', label: 'My Shopping Cart' },
              { href: '/wishlist', label: 'My Favorites List' },
              { href: '/offers', label: 'Special Offers' },
              { href: '/orders', label: 'Track My Order' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-medium text-gray-500 hover:text-brand-red transition-all flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-brand-red transition-all" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Policy & Shipping */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6 relative pb-2 group">
            Deliverability
            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red rounded transition-all group-hover:w-12" />
          </h4>
          <ul className="space-y-4">
            <li className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-gray-600 tracking-tighter">Inside Dhaka</span>
              <span className="text-sm text-gray-400 font-semibold tracking-wide">60 ৳ (Express Delivery)</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-gray-600 tracking-tighter">Outside Dhaka</span>
              <span className="text-sm text-gray-400 font-semibold tracking-wide">120 ৳ (Standard Delivery)</span>
            </li>
            <li className="flex items-center gap-2 pt-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-white font-bold italic tracking-tight underline decoration-brand-red/50 underline-offset-4">FREE Delivery Over 999 ৳</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Direct Reach */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6 relative pb-2 group">
            Direct Reach
            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red rounded transition-all group-hover:w-12" />
          </h4>
          <ul className="space-y-5">
            <li className="flex items-center gap-4 group">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-brand-red transition-all">
                <Phone size={16} className="text-brand-red" />
              </div>
              <a href="tel:+8801919242866" className="text-sm font-bold text-gray-400 hover:text-white transition-colors tracking-tight">+880 1919-242866</a>
            </li>
            <li className="flex items-center gap-4 group">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-brand-red transition-all">
                <Mail size={16} className="text-brand-red" />
              </div>
              <a href="mailto:rsautomartshop@gmail.com" className="text-sm font-bold text-gray-400 hover:text-white transition-colors tracking-tight">rsautomartshop@gmail.com</a>
            </li>
            <li className="flex items-start gap-4 group">
              <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-brand-red transition-all">
                <MapPin size={16} className="text-brand-red" />
              </div>
              <span className="text-sm font-medium text-gray-400 leading-snug">North Chashara, Link Rd,<br /><span className="text-white font-bold">Dhaka, Bangladesh</span></span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Cinematic Bar */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="max-w-360 mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} <span className="text-white">RS AUTOMART</span> SHOP
            </p>
            <p className="text-[10px] text-gray-700 font-medium">PREMIUM AUTO COMPONENTS PROVIDER IN BANGLADESH</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* bKash */}
            <div className="px-4 py-2 bg-[#e2136e]/10 border border-[#e2136e]/20 rounded-xl flex items-center justify-center select-none shadow-sm hover:scale-105 transition-all">
              <span className="text-[#e2136e] font-black text-[14px] tracking-tight">bKash</span>
            </div>

            {/* VISA */}
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center select-none shadow-sm hover:scale-105 transition-all">
              <span className="text-blue-400 font-black italic text-[14px] tracking-widest leading-none">VISA</span>
            </div>

            {/* Mastercard */}
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 select-none shadow-sm hover:scale-105 transition-all">
              <div className="relative w-6 h-4 flex items-center">
                <div className="absolute left-0 w-4 h-4 rounded-full bg-[#EB001B] opacity-80 mix-blend-screen"></div>
                <div className="absolute left-2.5 w-4 h-4 rounded-full bg-[#F79E1B] opacity-80 mix-blend-screen"></div>
              </div>
              <span className="text-gray-200 font-black text-[11px] uppercase tracking-tighter hidden sm:block">mastercard</span>
            </div>

            {/* COD */}
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 select-none shadow-sm hover:scale-105 transition-all">
              <Banknote size={16} className="text-green-400" />
              <span className="text-green-400 font-black text-[12px] uppercase tracking-wide">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
