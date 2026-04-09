'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    api.get(`/products/admin?${params}`)
      .then(({ data }) => { setProducts(data.products); setPagination(data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [page, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Sticky Header - No gaps */}
      <div className="sticky top-0 z-20 bg-gray-50 px-6 py-6 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products ({pagination.total})</h1>
          <Button nativeButton={false} render={<Link href="/admin/products/new" />} className="bg-brand-red hover:bg-brand-red-dark">
            <Plus size={16} className="mr-1" /> Add Product
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md flex-1">
            <Input 
              placeholder="Search products..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="bg-white" 
            />
            <Button type="submit" variant="outline" className="bg-white">
              <Search size={16} />
            </Button>
          </form>

          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">



      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {product.images?.[0]?.url && (
                        <Image src={product.images[0].url} alt="" width={48} height={48} className="object-cover w-full h-full" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                  <td className="px-4 py-3">{product.category?.name || '-'}</td>
                  <td className="px-4 py-3">
                    {product.discountPrice ? (
                      <div>
                        <span className="font-semibold text-brand-red">{formatPrice(product.discountPrice)}</span>
                        <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>
                      </div>
                    ) : (
                      <span className="font-semibold">{formatPrice(product.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{product.stock?.quantity}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/admin/products/${product._id}`} />}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(product._id)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="hidden sm:inline-flex"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.pages || (p >= page - 2 && p <= page + 2))
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center">
                    {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-gray-400">...</span>}
                    <Button
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={cn("w-9 px-0", p === page ? "bg-brand-red hover:bg-brand-red-dark" : "")}
                    >
                      {p}
                    </Button>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage(pagination.pages)}
              className="hidden sm:inline-flex"
            >
              Last
            </Button>
          </div>
        )}
      </div>
    </div>


  );
}
