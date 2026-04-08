'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 20 });

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams({ 
      page: String(page), 
      limit: '20' 
    });
    if (search) params.set('search', search);
    
    api.get(`/admin/customers?${params}`)
      .then(({ data }) => { 
        setCustomers(data.customers || []); 
        setPagination(data.pagination || { total: 0, pages: 0 }); 
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchCustomers(); 
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Database</h1>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
            Managing {pagination.total} registered users
          </p>
        </div>
        <div className="hidden md:block">
           <Badge variant="outline" className="px-4 py-2 text-xs font-bold uppercase tracking-widest">
              RS AUTOMART USERS
           </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone number..." 
              className="w-full h-11 pl-10 pr-4 bg-transparent border-none text-sm focus:outline-none focus:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-brand-black text-white hover:bg-brand-red px-6 rounded-lg transition-all font-bold text-xs uppercase tracking-widest">
            Search
          </Button>
        </form>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">
                <th className="px-6 py-4 text-left font-bold">Profile</th>
                <th className="px-6 py-4 text-left font-bold">Contact Channel</th>
                <th className="px-6 py-4 text-left font-bold">Membership</th>
                <th className="px-6 py-4 text-right font-bold">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="px-6 py-6"><Skeleton className="h-12 w-full rounded-lg" /></td></tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center space-y-4">
                    <Users size={48} className="mx-auto text-gray-200" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No client records found</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 border border-gray-200 uppercase">
                          {customer.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-brand-red transition-colors">{customer.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">Verified Member</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <Mail size={12} className="text-gray-300" /> {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 font-medium font-mono text-xs">
                          <Phone size={12} className="text-gray-300" /> {customer.phone || 'No phone provided'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center md:text-left">
                       <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none font-bold text-[9px] uppercase tracking-widest px-3">
                         Active
                       </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-900">{new Date(customer.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Joined</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
              Showing <span className="text-gray-900 font-black">{customers.length}</span> results of <span className="text-gray-900 font-black">{pagination.total}</span>
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 rounded-xl border-gray-200 group"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Prev
              </Button>
              
              <div className="flex items-center gap-1 mx-3">
                {(() => {
                  const pages = [];
                  const total = pagination.pages;
                  const delta = 2; 
                  
                  for (let i = 1; i <= total; i++) {
                    if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition-all border
                            ${page === i ? 'bg-brand-black border-brand-black text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
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
                className="h-9 px-3 rounded-xl border-gray-200 group"
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
                <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
