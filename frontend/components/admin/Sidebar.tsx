'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Tag, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/offers', icon: Tag, label: 'Offers & Coupons' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-black min-h-screen text-white flex-shrink-0 hidden lg:block">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-small.png" alt="RS Automart" className="h-8 invert brightness-110" />
        </Link>
        <p className="text-[10px] uppercase font-black text-brand-red mt-2 tracking-widest border border-brand-red/30 inline-block px-2 py-0.5 rounded">
          Admin Control
        </p>
      </div>
      <nav className="mt-2 px-3 space-y-1">
        {menuItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-brand-red/20 text-brand-red'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-6">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <ArrowLeft size={16} /> Back to Store
        </Link>
      </div>
    </aside>
  );
}
