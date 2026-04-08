'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', price: '', discountPrice: '',
    category: '', brand: '', sku: '', stockQuantity: '0', warranty: '',
    tags: '', isFeatured: false, isBestSeller: false, isNewArrival: false, isActive: true,
  });
  const [variants, setVariants] = useState<{ type: string; value: string; price: string; stock: string }[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.description) {
      toast.error('Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (typeof val === 'boolean') formData.append(key, String(val));
        else formData.append(key, val as string);
      });
      if (variants.length > 0) formData.append('variants', JSON.stringify(variants));
      if (specs.length > 0) formData.append('specifications', JSON.stringify(specs));
      if (form.tags) formData.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim())));
      images.forEach((img) => formData.append('images', img));

      await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product created');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Auto-generated if empty" />
              </div>
              <div>
                <Label>Category *</Label>
                <select className="w-full h-10 px-3 border rounded-md text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Short Description</Label>
              <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
            </div>
            <div>
              <Label>Full Description *</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Price (৳) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div>
                <Label>Discount Price (৳)</Label>
                <Input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
              </div>
            </div>
            <div className="mt-4">
              <Label>Warranty</Label>
              <Input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} placeholder="e.g., 1 Year Warranty" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Images (Max 6)</CardTitle>
              {images.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setImages([])} className="text-red-500 hover:text-red-700">
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
              {images.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-red cursor-pointer transition-colors bg-gray-50">
                  <div className="flex flex-col items-center text-gray-500">
                    <Plus size={24} />
                    <span className="text-xs mt-1 font-medium">Add Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setImages((prev) => [...prev, ...files].slice(0, 6));
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              * JPEG, PNG, or WebP. Max 6 images. First image will be the primary thumbnail.
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
          <CardContent>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                <Input placeholder="Type (color/size)" value={v.type} onChange={(e) => { const nv = [...variants]; nv[i].type = e.target.value; setVariants(nv); }} />
                <Input placeholder="Value" value={v.value} onChange={(e) => { const nv = [...variants]; nv[i].value = e.target.value; setVariants(nv); }} />
                <Input placeholder="Price" type="number" value={v.price} onChange={(e) => { const nv = [...variants]; nv[i].price = e.target.value; setVariants(nv); }} />
                <Input placeholder="Stock" type="number" value={v.stock} onChange={(e) => { const nv = [...variants]; nv[i].stock = e.target.value; setVariants(nv); }} />
                <Button type="button" variant="outline" size="sm" onClick={() => setVariants(variants.filter((_, j) => j !== i))}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { type: '', value: '', price: '', stock: '' }])}>
              + Add Variant
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
          <CardContent>
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <Input placeholder="Key" value={s.key} onChange={(e) => { const ns = [...specs]; ns[i].key = e.target.value; setSpecs(ns); }} />
                <Input placeholder="Value" value={s.value} onChange={(e) => { const ns = [...specs]; ns[i].value = e.target.value; setSpecs(ns); }} />
                <Button type="button" variant="outline" size="sm" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setSpecs([...specs, { key: '', value: '' }])}>
              + Add Specification
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Additional Settings</CardTitle></CardHeader>
          <CardContent>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g., dash cam, 4k, electronics" />
            </div>
            <div className="flex flex-wrap gap-6 mt-4">
              {(['isFeatured', 'isBestSeller', 'isNewArrival', 'isActive'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form[key]}
                    onCheckedChange={(v) => setForm({ ...form, [key]: !!v })}
                  />
                  <span className="text-sm">{key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="bg-brand-red hover:bg-brand-red-dark" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
