'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState<any>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [specs, setSpecs] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get(`/products?limit=1000`), // We need product by ID, use the list
    ]).then(([catRes]) => {
      setCategories(catRes.data.categories);
    }).catch(() => {});

    // Fetch product by ID via search
    api.get(`/products?limit=1000`).then(({ data }) => {
      const product = data.products.find((p: any) => p._id === id);
      if (product) {
        setForm({
          name: product.name, description: product.description, shortDescription: product.shortDescription || '',
          price: String(product.price), discountPrice: String(product.discountPrice || ''),
          category: product.category?._id || '', brand: product.brand || '', sku: product.sku,
          stockQuantity: String(product.stock?.quantity || 0), warranty: product.warranty || '',
          tags: (product.tags || []).join(', '),
          isFeatured: product.isFeatured, isBestSeller: product.isBestSeller,
          isNewArrival: product.isNewArrival, isActive: product.isActive,
          existingImages: product.images || [],
        });
        setVariants(product.variants || []);
        setSpecs(product.specifications || []);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'existingImages') formData.append(key, JSON.stringify(val));
        else if (typeof val === 'boolean') formData.append(key, String(val));
        else formData.append(key, val as string);
      });
      if (variants.length > 0) formData.append('variants', JSON.stringify(variants));
      if (specs.length > 0) formData.append('specifications', JSON.stringify(specs));
      if (form.tags) formData.append('tags', JSON.stringify(form.tags.split(',').map((t: string) => t.trim())));
      images.forEach((img) => formData.append('images', img));

      await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product updated');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={form.sku || ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div>
                <Label>Category *</Label>
                <select className="w-full h-10 px-3 border rounded-md text-sm" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Short Description</Label>
              <Input value={form.shortDescription || ''} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea rows={5} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Price (৳)</Label><Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Discount Price</Label><Input type="number" value={form.discountPrice || ''} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} /></div>
              <div><Label>Stock Quantity</Label><Input type="number" value={form.stockQuantity || ''} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></div>
            </div>
            <div className="mt-4"><Label>Warranty</Label><Input value={form.warranty || ''} onChange={(e) => setForm({ ...form, warranty: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Images</CardTitle>
              <div className="text-xs text-gray-400">
                Total: {(form.existingImages?.length || 0) + images.length} / 6
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
              {/* Existing Images */}
              {form.existingImages?.map((img: any, i: number) => (
                <div key={`existing-${i}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-brand-red/20 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-brand-red text-white text-[8px] font-bold px-1 rounded">LIVE</div>
                  <button
                    type="button"
                    onClick={() => {
                      const newExisting = form.existingImages.filter((_: any, j: number) => j !== i);
                      setForm({ ...form, existingImages: newExisting });
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* New Image Previews */}
              {images.map((file, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-500/20 group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-green-500 text-white text-[8px] font-bold px-1 rounded">NEW</div>
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Add Button */}
              {(form.existingImages?.length || 0) + images.length < 6 && (
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-red cursor-pointer transition-colors bg-gray-50">
                  <Plus size={24} className="text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setImages([...images, ...files].slice(0, 6 - (form.existingImages?.length || 0)));
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              * Red border = Existing on server. Green border = New upload. First visible image will be primary.
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent>
            <div><Label>Tags</Label><Input value={form.tags || ''} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
            <div className="flex flex-wrap gap-6 mt-4">
              {(['isFeatured', 'isBestSeller', 'isNewArrival', 'isActive'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={!!form[key]} onCheckedChange={(v) => setForm({ ...form, [key]: !!v })} />
                  <span className="text-sm">{key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="bg-brand-red hover:bg-brand-red-dark" disabled={saving}>{saving ? 'Saving...' : 'Update Product'}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
