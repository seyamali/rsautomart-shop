'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import CartDrawer from '@/components/cart/CartDrawer';
import CategoryBar from '@/components/layout/CategoryBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const wishlistItems = useWishlistStore((s) => s.items);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const [categories, setCategories] = useState<any[]>([]);
  
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-brand-black text-white py-1.5 text-[11px] sm:text-xs tracking-wide font-medium overflow-hidden">
        {/* Desktop / tablet: static centered */}
        <div className="hidden sm:block text-center">
          🚚 FREE SHIPPING on orders over ৳999 &nbsp;|&nbsp; Cash on Delivery Available
        </div>
        {/* Mobile: marquee */}
        <div className="sm:hidden whitespace-nowrap">
          <div className="inline-block animate-marquee">
            <span className="mx-6">🚚 FREE SHIPPING on orders over ৳999</span>
            <span className="mx-6">💵 Cash on Delivery</span>
            <span className="mx-6">📞 +880 1919-242866</span>
            <span className="mx-6">🚚 FREE SHIPPING on orders over ৳999</span>
            <span className="mx-6">💵 Cash on Delivery</span>
            <span className="mx-6">📞 +880 1919-242866</span>
          </div>
        </div>
      </div>

      {/* Main Navbar & Category Bar Wrapper */}
      <header className="sticky top-0 z-50 flex flex-col shadow-sm">
        <div className="bg-white border-b border-gray-200 w-full relative z-50">
          <div className="max-w-360 mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 order-first"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo-small.png" alt="RS Automart" width={180} height={50} className="h-9 md:h-10 w-auto" priority />
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="order-3 lg:order-2 w-full lg:flex-1 lg:max-w-xl">
            <div className="flex border-2 border-brand-red rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search for parts, accessories, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white placeholder-gray-400"
              />
              <button type="submit" className="bg-brand-black hover:bg-brand-red transition-colors px-5 flex items-center justify-center">
                <Search size={16} className="text-white" />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="order-2 lg:order-3 flex items-center gap-3 md:gap-5 flex-shrink-0">
            {/* Wishlist */}
            <Link href="/wishlist" className="hidden md:flex flex-col items-center text-gray-600 hover:text-brand-red transition-colors group">
              <span className="relative">
                <Heart size={20} className="group-hover:scale-110 transition-transform" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-brand-red text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none">
                    {wishlistItems.length}
                  </span>
                )}
              </span>
              <span className="text-[10px] mt-0.5 font-medium uppercase tracking-wide">Wishlist</span>
            </Link>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative flex flex-col items-center text-gray-600 hover:text-brand-red transition-colors group">
              <span className="relative">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-brand-red text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none">
                    {itemCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] mt-0.5 font-medium uppercase tracking-wide">Cart</span>
            </button>

            {/* Offers */}
            <Link href="/offers" className="hidden lg:flex flex-col items-center text-gray-600 hover:text-brand-red transition-colors group">
              <span className="relative">
                <Ticket size={20} className="group-hover:scale-110 transition-transform" />
              </span>
              <span className="text-[10px] mt-0.5 font-medium uppercase tracking-wide">Offers</span>
            </Link>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-1" />}>
                  <User size={18} />
                  <span className="hidden sm:inline text-xs">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href="/profile" />}>My Profile</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/orders" />}>My Orders</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/wishlist" />}>Wishlist</DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link href="/admin" />}>Admin Dashboard</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded hover:bg-brand-red transition-colors"
              >
                <User size={14} /> Sign In
              </Link>
            )}
          </div>
        </div>
        </div>

        <CategoryBar />

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <Image src="/logo-small.png" alt="RS Automart" width={140} height={40} className="h-8 w-auto" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-900" />
              </button>
            </div>
            
            <div className="px-4 py-4 border-b bg-gray-50/50">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(e); setMobileMenuOpen(false); }} className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                   type="text" 
                   placeholder="Search products..." 
                   className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold focus:border-brand-red outline-none transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col scrollbar-hide py-10">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-4 px-2 tracking-widest leading-none">Main Menu</p>
              <div className="space-y-1 mb-6">
                <Link 
                  href="/shop" 
                  className="flex items-center justify-between py-3.5 px-3 rounded-2xl hover:bg-gray-50 text-gray-900 font-bold uppercase tracking-wide transition-all group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                  <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-brand-red transition-colors" />
                </Link>
                <Link 
                  href="/offers" 
                  className="flex items-center justify-between py-3.5 px-3 rounded-2xl hover:bg-gray-50 text-brand-red font-black uppercase tracking-wide transition-all group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-brand-red/10 flex items-center justify-center">
                        <Ticket size={16} />
                     </div>
                     Offers & Deals
                  </span>
                  <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-brand-red transition-colors" />
                </Link>
              </div>

              <p className="text-[10px] uppercase font-black text-gray-400 mb-4 px-2 tracking-widest leading-none">Browse Categories</p>
              <div className="space-y-1 mb-6">
                {categories.map((cat) => (
                  <Link 
                    key={cat._id}
                    href={`/shop/${cat.slug}`}
                    className="flex items-center justify-between py-3 px-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold text-sm tracking-wide transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat.name}
                    <ChevronDown size={14} className="-rotate-90 text-gray-200 group-hover:text-brand-red transition-colors" />
                  </Link>
                ))}
              </div>
              
              <p className="text-[10px] uppercase font-black text-gray-400 mb-4 px-2 tracking-widest leading-none">Personal</p>
              <div className="space-y-1">
                <Link 
                  href="/wishlist" 
                  className="flex items-center justify-between py-3.5 px-3 rounded-2xl hover:bg-gray-50 text-gray-900 font-bold uppercase tracking-wide transition-all group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                        <Heart size={16} />
                     </div>
                     My Wishlist
                  </span>
                  <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-brand-red transition-colors" />
                </Link>
              </div>
              
              <div className="my-4 border-t border-gray-100" />
              <p className="text-[10px] uppercase font-black text-gray-400 mb-4 px-2 tracking-widest leading-none">My Account</p>

              {user ? (
                <div className="space-y-1">
                  <Link 
                    href="/profile" 
                    className="flex items-center justify-between py-4 px-3 rounded-2xl hover:bg-gray-50 text-gray-900 font-bold uppercase tracking-wide transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                         <User size={16} />
                      </div>
                      Account Settings
                    </span>
                    <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-brand-red transition-colors" />
                  </Link>
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center py-4 px-5 text-gray-400 font-bold uppercase tracking-tight text-[11px] hover:text-brand-red transition-colors"
                  >
                    Sign out of your account
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-brand-black text-white p-5 rounded-[2rem] flex items-center justify-between font-black uppercase tracking-widest shadow-xl shadow-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In / Register
                  <User size={18} className="text-gray-400" />
                </Link>
              )}
            </nav>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
               <p className="text-[10px] uppercase font-black text-gray-400 mb-4 tracking-tighter">Support & Contact</p>
               <div className="flex flex-col gap-3">
                  <a href="tel:+8801700000000" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                       <i className="text-xs">📞</i>
                    </div>
                    +880 1700-000000
                  </a>
                  <a href="mailto:support@rsautomart.com" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                       <i className="text-xs">✉️</i>
                    </div>
                    support@rsautomart.com
                  </a>
               </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
