'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Ticket, Tag, Calendar, Package, Copy, CheckCircle2, Search, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Separator } from '@/components/ui/separator';

type ProductOption = {
  _id: string;
  name: string;
  price: number;
};

type CategoryOption = {
  _id: string;
  name: string;
  slug: string;
};

type CouponItem = {
  _id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  maxUses: number;
  usedCount: number;
  perUserMaxUses: number;
  expiresAt: string;
  isActive: boolean;
};

type OfferItem = {
  _id: string;
  title: string;
  description?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products?: ProductOption[];
  categories?: CategoryOption[];
  banner?: { url: string; publicId: string };
};

type CouponForm = {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  maxUses: string;
  perUserMaxUses: string;
  expiresAt: string;
  isActive: boolean;
};

type OfferForm = {
  title: string;
  description: string;
  discountPercent: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
  isActive: boolean;
};

const emptyCouponForm: CouponForm = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  maxUses: '',
  perUserMaxUses: '1',
  expiresAt: '',
  isActive: true,
};

const emptyOfferForm: OfferForm = {
  title: '',
  description: '',
  discountPercent: '',
  startDate: '',
  endDate: '',
  bannerUrl: '',
  isActive: true,
};

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '');

export default function AdminOffersPage() {
  const [activeTab, setActiveTab] = useState<'offers' | 'coupons'>('offers');
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [offerEditId, setOfferEditId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<OfferForm>(emptyOfferForm);

  const [couponEditId, setCouponEditId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState<CouponForm>(emptyCouponForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [offersRes, couponsRes, productsRes, categoriesRes] = await Promise.all([
        api.get('/offers/admin'),
        api.get('/payment/coupons'),
        api.get('/products/admin?limit=500'),
        api.get('/categories/admin'),
      ]);

      setOffers(offersRes.data.offers || []);
      setCoupons(couponsRes.data.coupons || []);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetOfferForm = () => {
    setOfferForm(emptyOfferForm);
    setSelectedProductIds([]);
    setSelectedCategoryIds([]);
    setOfferEditId(null);
  };

  const resetCouponForm = () => {
    setCouponForm(emptyCouponForm);
    setCouponEditId(null);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...offerForm,
        discountPercent: Number(offerForm.discountPercent),
        products: selectedProductIds,
        categories: selectedCategoryIds,
      };

      if (offerEditId) {
        await api.put(`/offers/${offerEditId}`, payload);
        toast.success('Offer updated');
      } else {
        await api.post('/offers', payload);
        toast.success('Offer created');
      }

      resetOfferForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount) || 0,
        maxDiscountAmount: Number(couponForm.maxDiscountAmount) || 0,
        maxUses: Number(couponForm.maxUses) || 0,
        perUserMaxUses: Number(couponForm.perUserMaxUses) || 0,
      };

      if (couponEditId) {
        await api.put(`/payment/coupons/${couponEditId}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/payment/coupons', payload);
        toast.success('Coupon created');
      }

      resetCouponForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await api.delete(`/offers/${id}`);
      toast.success('Offer deleted');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete offer');
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/payment/coupons/${id}`);
      toast.success('Coupon deleted');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const startEditOffer = (offer: OfferItem) => {
    setOfferEditId(offer._id);
    setOfferForm({
      title: offer.title,
      description: offer.description || '',
      discountPercent: String(offer.discountPercent),
      startDate: toDateInput(offer.startDate),
      endDate: toDateInput(offer.endDate),
      bannerUrl: offer.banner?.url || '',
      isActive: offer.isActive,
    });
    setSelectedProductIds((offer.products || []).map((product) => product._id));
    setSelectedCategoryIds((offer.categories || []).map((category) => category._id));
    setActiveTab('offers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditCoupon = (coupon: CouponItem) => {
    setCouponEditId(coupon._id);
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscountAmount: String(coupon.maxDiscountAmount || ''),
      maxUses: String(coupon.maxUses),
      perUserMaxUses: String(coupon.perUserMaxUses ?? 1),
      expiresAt: toDateInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });
    setActiveTab('coupons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelected = (value: string, current: string[], setter: (value: string[]) => void) => {
    setter(current.includes(value) ? current.filter((id) => id !== value) : [...current, value]);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col gap-6 p-6 lg:p-10">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur py-4 border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-black">Offers & Coupons</h1>
            <p className="text-sm text-gray-500 font-medium">Create and manage promotional deals for your customers.</p>
          </div>
          <div className="bg-white p-1 rounded-xl border flex gap-1 shadow-sm">
            <button
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'offers' ? 'bg-brand-red text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('offers')}
            >
              <Tag size={16} />
              Offers ({offers.length})
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'coupons' ? 'bg-brand-red text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('coupons')}
            >
              <Ticket size={16} />
              Coupons ({coupons.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 font-bold animate-pulse">Synchronizing Promotions...</p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8 items-start">
          
          {/* Left Column: Fixed/Sticky Action Form */}
          <div className="lg:sticky lg:top-[120px] space-y-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
              <div className="bg-brand-black p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-wider italic">
                            {activeTab === 'offers' ? (offerEditId ? 'Modify Offer' : 'Craft Offer') : (couponEditId ? 'Edit Coupon' : 'Create Coupon')}
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">RS Automart Promotion Engine</p>
                    </div>
                    <div className="bg-brand-red p-2 rounded-xl">
                        {activeTab === 'offers' ? <Tag size={20} /> : <Ticket size={20} />}
                    </div>
                </div>
              </div>

              <CardContent className="p-8">
                {activeTab === 'offers' ? (
                  <form onSubmit={handleOfferSubmit} className="space-y-6">
                    <div className="space-y-4 border-b pb-6">
                        <div className="grid gap-2">
                           <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Offer Title</Label>
                           <Input 
                             value={offerForm.title} 
                             onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} 
                             placeholder="e.g. Summer Performance Sale"
                             className="rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white"
                             required 
                           />
                        </div>
                        <div className="grid gap-2">
                           <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Description</Label>
                           <Textarea
                             value={offerForm.description}
                             onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                             placeholder="Details of the offer..."
                             className="rounded-xl border-gray-100 bg-gray-50/50 font-medium focus:bg-white resize-none"
                             rows={3}
                           />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Discount %</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={offerForm.discountPercent}
                                onChange={(e) => setOfferForm({ ...offerForm, discountPercent: e.target.value })}
                                className="rounded-xl border-gray-100 bg-gray-50/50 font-black text-brand-red"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Status</Label>
                            <div className="flex items-center gap-3 bg-gray-50 h-10 px-4 rounded-xl border border-gray-100">
                                <input
                                    id="offer-active"
                                    type="checkbox"
                                    className="accent-brand-red w-4 h-4"
                                    checked={offerForm.isActive}
                                    onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                                />
                                <Label htmlFor="offer-active" className="font-bold cursor-pointer">Live</Label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Launch Date</Label>
                            <Input
                                type="date"
                                value={offerForm.startDate}
                                onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                                className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Expiry Date</Label>
                            <Input
                                type="date"
                                value={offerForm.endDate}
                                onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                                className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Scope Selection</Label>
                            
                            <div className="space-y-4">
                                <div className="border rounded-2xl p-4 bg-gray-50/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase text-gray-400">Products ({selectedProductIds.length})</span>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2 text-gray-400" size={12} />
                                            <input 
                                                className="bg-white border rounded-lg pl-7 pr-2 py-1 text-[10px] outline-none" 
                                                placeholder="Filter..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[120px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                                        {filteredProducts.map(p => (
                                            <label key={p._id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                                                <input
                                                  type="checkbox"
                                                  className="accent-brand-red"
                                                  checked={selectedProductIds.includes(p._id)}
                                                  onChange={() => toggleSelected(p._id, selectedProductIds, setSelectedProductIds)}
                                                />
                                                <span className="text-[11px] font-bold text-gray-700 flex-1 truncate">{p.name}</span>
                                                <span className="text-[10px] text-brand-red font-black">৳{p.price}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border rounded-2xl p-4 bg-gray-50/30">
                                    <span className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Categories ({selectedCategoryIds.length})</span>
                                    <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto custom-scrollbar">
                                        {categories.map(c => (
                                            <label key={c._id} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                                selectedCategoryIds.includes(c._id) ? 'bg-brand-red border-brand-red text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-brand-red'
                                            }`}>
                                                <input
                                                  type="checkbox"
                                                  className="hidden"
                                                  checked={selectedCategoryIds.includes(c._id)}
                                                  onChange={() => toggleSelected(c._id, selectedCategoryIds, setSelectedCategoryIds)}
                                                />
                                                {c.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" className="flex-1 rounded-2xl bg-brand-red hover:bg-brand-red-dark font-black uppercase h-12 shadow-lg shadow-brand-red/20 transition-all active:scale-95">
                            {offerEditId ? 'Update Deal' : 'Launch Offer'}
                        </Button>
                        {offerEditId && (
                            <Button type="button" variant="outline" onClick={resetOfferForm} className="rounded-2xl h-12 px-6 border-gray-200 font-bold uppercase transition-all">
                                <X size={18} />
                            </Button>
                        )}
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Voucher Code</Label>
                        <Input
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          placeholder="SALE50"
                          className="rounded-xl border-gray-100 bg-gray-50/50 font-black text-brand-red tracking-widest uppercase focus:bg-white text-lg h-12"
                          required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Discount Type</Label>
                            <select
                              className="w-full h-11 px-4 border border-gray-100 rounded-xl bg-gray-50 font-bold text-sm outline-none focus:bg-white"
                              value={couponForm.discountType}
                              onChange={(e) =>
                                setCouponForm({ ...couponForm, discountType: e.target.value as CouponForm['discountType'] })
                              }
                            >
                              <option value="percent">Percent (%)</option>
                              <option value="fixed">Fixed (BDT)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Active</Label>
                            <div className="flex items-center gap-3 bg-gray-50 h-11 px-4 rounded-xl border border-gray-100">
                                <input
                                    id="coupon-active"
                                    type="checkbox"
                                    className="accent-brand-red w-4 h-4"
                                    checked={couponForm.isActive}
                                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                                />
                                <Label htmlFor="coupon-active" className="font-bold cursor-pointer">Live</Label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Value</Label>
                            <Input
                                type="number"
                                min="0"
                                value={couponForm.discountValue}
                                onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                className="rounded-xl h-11 border-gray-100 bg-gray-50/50 font-black text-brand-red"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                    <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Min Order</Label>
                    <Input
                        type="number"
                        min="0"
                        value={couponForm.minOrderAmount}
                                onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                        className="rounded-xl h-11 border-gray-100 bg-gray-50/50 font-bold"
                    />
                </div>
                <div className="grid gap-2">
                    <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Max Discount Amount</Label>
                    <Input
                        type="number"
                        min="0"
                        value={couponForm.maxDiscountAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                        placeholder="e.g. 100"
                        className="rounded-xl h-11 border-gray-100 bg-gray-50/50 font-bold"
                    />
                    <p className="text-[10px] text-gray-400 px-1">Use 0 for unlimited cap. Works with percentage coupons.</p>
                </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Max Total Uses</Label>
                            <Input
                                type="number"
                                min="0"
                                value={couponForm.maxUses}
                                onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                                placeholder="∞"
                                className="rounded-xl h-11 border-gray-100 bg-gray-50/50 font-bold"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Per User Max</Label>
                            <Input
                                type="number"
                                min="0"
                                value={couponForm.perUserMaxUses}
                                onChange={(e) => setCouponForm({ ...couponForm, perUserMaxUses: e.target.value })}
                                className="rounded-xl h-11 border-gray-100 bg-gray-50/50 font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-black text-gray-400 tracking-widest pl-1">Expires On</Label>
                        <Input
                          type="date"
                          value={couponForm.expiresAt}
                          onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                          className="rounded-xl h-11 border-gray-100 bg-gray-50/50 font-bold"
                          required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" className="flex-1 rounded-2xl bg-brand-red hover:bg-brand-red-dark font-black uppercase h-12 shadow-lg shadow-brand-red/20 transition-all active:scale-95">
                            {couponEditId ? 'Update Token' : 'Generate Token'}
                        </Button>
                        {couponEditId && (
                            <Button type="button" variant="outline" onClick={resetCouponForm} className="rounded-2xl h-12 px-6 border-gray-200 font-bold uppercase transition-all">
                                <X size={18} />
                            </Button>
                        )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Scrollable Content List */}
          <div className="space-y-6">
            {activeTab === 'offers' ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black uppercase tracking-widest text-gray-400 text-xs">Recently Deployed Offers</h3>
                        <Badge variant="outline" className="rounded-lg">{offers.length} ACTIVE</Badge>
                    </div>
                    {offers.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] p-20 text-center space-y-4">
                            <Tag className="mx-auto text-gray-200" size={48} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Active Offers Found</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-2">
                            {offers.map((offer) => (
                                <Card key={offer._id} className="group overflow-hidden rounded-[2rem] border-none shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="h-full flex flex-col">
                                        <div className="p-6 flex-1 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black text-gray-900 group-hover:text-brand-red transition-colors">{offer.title}</h3>
                                                    <div className="flex gap-2">
                                                        <Badge className={offer.isActive ? "bg-green-500/10 text-green-600 border-none px-2 py-0 text-[10px] font-black uppercase" : "bg-gray-100 text-gray-400 border-none px-2 py-0 text-[10px] font-black uppercase"}>
                                                            {offer.isActive ? 'Live' : 'Paused'}
                                                        </Badge>
                                                        <Badge variant="outline" className="px-2 py-0 text-[10px] font-black text-brand-red border-brand-red/20 uppercase font-medium">
                                                            {offer.discountPercent}% OFF
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-brand-red hover:text-white" onClick={() => startEditOffer(offer)}>
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 text-red-500" onClick={() => deleteOffer(offer._id)}>
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium line-clamp-2">{offer.description || 'No description provided.'}</p>
                                            
                                            <Separator className="bg-gray-50" />
                                            
                                            <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
                                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                                    <p className="text-[9px] uppercase text-gray-400 mb-1 tracking-wider">Start</p>
                                                    <div className="flex items-center gap-1.5 text-gray-700">
                                                        <Calendar size={12} className="text-brand-red" />
                                                        {toDateInput(offer.startDate)}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                                    <p className="text-[9px] uppercase text-gray-400 mb-1 tracking-wider">Ends</p>
                                                    <div className="flex items-center gap-1.5 text-gray-700">
                                                        <Calendar size={12} className="text-brand-red" />
                                                        {toDateInput(offer.endDate)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-brand-red/10 border-2 border-white flex items-center justify-center text-[8px] font-black text-brand-red">
                                                        P
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-brand-black/5 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-500">
                                                        C
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                    {offer.products?.length || 0} Products • {offer.categories?.length || 0} Categories
                                                </span>
                                            </div>
                                            <button className="text-[10px] font-black uppercase text-brand-red hover:underline underline-offset-4 decoration-2">
                                                More Info
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black uppercase tracking-widest text-gray-400 text-xs">Active Voucher Registry</h3>
                        <Badge variant="outline" className="rounded-lg">{coupons.length} TOTAL</Badge>
                    </div>
                    {coupons.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] p-20 text-center space-y-4">
                            <Ticket className="mx-auto text-gray-200" size={48} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Active Coupons Found</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {coupons.map((coupon) => (
                                <div key={coupon._id} className="group bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col gap-6 shadow-md hover:shadow-2xl hover:border-brand-red/10 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xl font-black text-brand-red tracking-widest uppercase">{coupon.code}</code>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="h-6 w-6 rounded-full"
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code);
                                                    toast.success("Code copied");
                                                  }}
                                                >
                                                    <Copy size={12} />
                                                </Button>
                                            </div>
                                            <Badge variant={coupon.isActive ? "default" : "secondary"} className={coupon.isActive ? "bg-green-500/10 text-green-600 border-none px-2 py-0 text-[9px] font-black uppercase" : ""}>
                                                {coupon.isActive ? 'Valid' : 'Revoked'}
                                            </Badge>
                                        </div>
                                        <div className="flex -space-x-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-brand-red hover:text-white" onClick={() => startEditCoupon(coupon)}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 text-red-500" onClick={() => deleteCoupon(coupon._id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gray-50 space-y-3 relative overflow-hidden">
                                        <div className="flex items-center justify-between text-brand-red">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Benefit</span>
                                            <span className="text-lg font-black">
                                                {coupon.discountType === 'percent'
                                                    ? `${coupon.discountValue}% OFF`
                                                    : `৳${coupon.discountValue} OFF`}
                                            </span>
                                        </div>
                                        {coupon.discountType === 'percent' && coupon.maxDiscountAmount > 0 && (
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span className="text-gray-400">Cap</span>
                                                <span className="text-gray-700">Max ৳{coupon.maxDiscountAmount}</span>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span className="text-gray-400">Used</span>
                                                <span className="text-gray-700">{coupon.usedCount} / {coupon.maxUses || '∞'}</span>
                                            </div>
                                            <div className="w-full h-1 bg-white rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-brand-red transition-all duration-500" 
                                                    style={{ width: `${coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-tighter">
                                            <div className="flex flex-col gap-1 items-center justify-center p-2 rounded-xl border border-gray-50 border-dashed">
                                                <span className="text-gray-300">Min Order</span>
                                                <span className="text-gray-600">৳{coupon.minOrderAmount}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 items-center justify-center p-2 rounded-xl border border-gray-50 border-dashed">
                                                <span className="text-gray-300">User Cap</span>
                                                <span className="text-gray-600">{coupon.perUserMaxUses || '∞'}x</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 px-1">
                                            <Clock size={12} className="text-brand-red" />
                                            <span className="text-[10px] font-black uppercase tracking-tight">Expires {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
