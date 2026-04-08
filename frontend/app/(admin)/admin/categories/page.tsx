'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '', parent: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const fetchCategories = () => {
    api.get('/categories/admin').then(({ data }) => setCategories(data.categories)).catch(() => {});
  };


  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (form.parent) formData.append('parent', form.parent);
      if (image) formData.append('image', image);

      if (editId) {
        await api.put(`/categories/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated');
      } else {
        await api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created');
      }
      setForm({ name: '', description: '', parent: '' });
      setEditId(null);
      setImage(null);
      setExistingImage(null);
      setOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (cat: any) => {
    setForm({ name: cat.name, description: cat.description || '', parent: cat.parent?._id || '' });
    setEditId(cat._id);
    setExistingImage(cat.image?.url || null);
    setImage(null);
    setOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Sticky Header - No gaps */}
      <div className="sticky top-0 z-20 bg-gray-50 px-6 py-6 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ name: '', description: '', parent: '' }); setImage(null); setExistingImage(null); } }}>
          <DialogTrigger render={<Button className="bg-brand-red hover:bg-brand-red-dark" />}>
            <Plus size={16} className="mr-1" /> Add Category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Parent Category</Label>
                <select className="w-full h-10 px-3 border rounded-md text-sm" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                  <option value="">None (Top Level)</option>
                  {categories.filter((c) => c._id !== editId).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  {(image || existingImage) && (
                    <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={image ? URL.createObjectURL(image) : existingImage!}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-brand-red-light file:text-brand-red" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-brand-red hover:bg-brand-red-dark">
                {editId ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 px-6 py-6 mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {categories.map((cat) => (
          <Card key={cat._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.slug}</p>
                  {cat.parent && <p className="text-xs text-gray-400">Parent: {cat.parent.name || cat.parent}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}><Edit size={16} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat._id)}><Trash2 size={16} className="text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

  );
}
