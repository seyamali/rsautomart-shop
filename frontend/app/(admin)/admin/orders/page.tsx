'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Calendar, 
  Package, 
  User, 
  CreditCard 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: '20' 
      });
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);

      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, pages: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
             Total: {pagination.total}
           </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by order # or customer..." 
              className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="bg-brand-black text-white px-4">Search</Button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`h-8 px-3 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex-shrink-0 border 
                ${filter === s ? 'bg-brand-red border-brand-red text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red'}`}
            >
              {s || 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium whitespace-nowrap">
                <th className="px-6 py-4 text-left font-semibold">Order</th>
                <th className="px-6 py-4 text-left font-semibold">Customer</th>
                <th className="px-6 py-4 text-left font-semibold">Price</th>
                <th className="px-6 py-4 text-left font-semibold">Payment</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4"><Skeleton className="h-10 w-full" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{order.orderNumber}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{order.user?.name || 'Guest'}</div>
                      <div className="text-[11px] text-gray-400">{order.user?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                      ৳{formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-500 uppercase font-bold tracking-tighter">{order.paymentMethod}</span>
                        <span className={`text-[10px] font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                          {order.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link href={`/admin/orders/${order._id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white hover:text-brand-red border border-transparent hover:border-gray-100">
                          <Eye size={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              Showing <span className="text-gray-900">{orders.length}</span> of <span className="text-gray-900">{pagination.total}</span> entries
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 rounded-lg border-gray-200"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={14} className="mr-1" /> Prev
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                {(() => {
                  const pages = [];
                  const total = pagination.pages;
                  const delta = 2; // Number of pages to show before and after current page
                  
                  for (let i = 1; i <= total; i++) {
                    if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                            ${page === i ? 'bg-brand-black text-white' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'}`}
                        >
                          {i}
                        </button>
                      );
                    } else if (i === page - delta - 1 || i === page + delta + 1) {
                      pages.push(<span key={i} className="px-1 text-gray-300">...</span>);
                    }
                  }
                  return pages;
                })()}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 rounded-lg border-gray-200"
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
