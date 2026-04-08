'use client';

import { useEffect, useState } from 'react';
import { Tag, Ticket, Clock, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

type Offer = {
  _id: string;
  title: string;
  description?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  banner?: { url: string };
  products?: { _id: string; name: string; price: number }[];
  categories?: { _id: string; name: string }[];
};

type Coupon = {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiresAt: string;
  description?: string;
  maxDiscountAmount?: number;
  maxUses?: number;
  usedCount?: number;
  perUserMaxUses?: number;
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [offersRes, couponsRes] = await Promise.all([
          api.get('/offers'),
          api.get('/payment/public-coupons')
        ]);
        setOffers(offersRes.data.offers || []);
        setCoupons(couponsRes.data.coupons || []);
      } catch (error) {
        console.error('Error fetching offers/coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`, {
        icon: <CheckCircle2 className="text-green-500" size={18} />
    });
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-sm font-medium mb-4">
              <Tag size={16} />
              <span>Limited Time Exclusive</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Huge Savings & <br />
              <span className="text-brand-red">Exclusive Coupons</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Don't miss out on our current deals! Browse active product offers and discover 
              coupons to save big on your next purchase.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Coupons Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-brand-red mb-1">
                <Ticket size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Discount Codes</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Available Coupons</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-4">
                <Ticket size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No coupons available</h3>
              <p className="text-gray-500">Check back soon for new discount codes!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.code} className="group relative bg-white rounded-2xl border p-1 overflow-hidden transition-all hover:shadow-xl hover:border-brand-red/20">
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge variant="secondary" className="bg-brand-red/10 text-brand-red hover:bg-brand-red/20 mb-2 border-none font-bold">
                          {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `${formatPrice(coupon.discountValue)} OFF`}
                        </Badge>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-red transition-colors">{coupon.code}</h3>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-brand-red/5 group-hover:text-brand-red transition-all">
                        <Ticket size={24} />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                       {coupon.description || 'Clear discount rules shown below.'}
                    </p>

                    <div className="mb-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Coupon rules</p>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between gap-4">
                          <span>Discount</span>
                          <span className="font-semibold">
                            {coupon.discountType === 'percent'
                              ? `${coupon.discountValue}% off${coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 ? ` up to ${formatPrice(coupon.maxDiscountAmount)}` : ''}`
                              : `${formatPrice(coupon.discountValue)} off`}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Min order</span>
                          <span className="font-semibold">
                            {coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : 'No minimum'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Total uses</span>
                          <span className="font-semibold">
                            {coupon.maxUses && coupon.maxUses > 0 ? `${coupon.usedCount || 0}/${coupon.maxUses}` : 'Unlimited'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Per user</span>
                          <span className="font-semibold">
                            {coupon.perUserMaxUses && coupon.perUserMaxUses > 0 ? `${coupon.perUserMaxUses} time${coupon.perUserMaxUses > 1 ? 's' : ''}` : 'Unlimited'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                         <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Expires</span>
                         <span className="text-xs font-semibold text-gray-700">{new Date(coupon.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(coupon.code)}
                        className="h-9 px-4 rounded-xl font-bold bg-gray-50 hover:bg-brand-red hover:text-white transition-all group/btn"
                      >
                        <Copy size={14} className="mr-2 group-hover/btn:scale-110 transition-transform" />
                        Copy Code
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Offers Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-brand-red mb-1">
                <Clock size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Limited Time</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Active Deals</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-3xl" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-4">
                <Tag size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No active deals</h3>
              <p className="text-gray-500">We're cooking up something special, stay tuned!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offers.map((offer) => (
                <div key={offer._id} className="group relative bg-white rounded-[2rem] border overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-2/5 relative min-h-[200px] overflow-hidden">
                      {offer.banner?.url ? (
                        <Image 
                          src={offer.banner.url} 
                          alt={offer.title} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-red/5 flex items-center justify-center text-brand-red/20">
                           <Tag size={64} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                         <Badge className="bg-white/95 backdrop-blur shadow-sm text-brand-red border-none font-black text-lg py-1 px-4 rounded-xl">
                            {offer.discountPercent}% OFF
                         </Badge>
                      </div>
                    </div>

                    <div className="md:w-3/5 p-8 flex flex-col">
                      <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-brand-red transition-colors line-clamp-1">{offer.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {offer.description || 'Exclusive discount on selected items and categories. Grab yours now!'}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {offer.categories?.map(cat => (
                            <Badge key={cat._id} variant="outline" className="text-[10px] font-bold uppercase rounded-lg border-gray-200">{cat.name}</Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                               <Clock size={14} className="text-brand-red" />
                               <span className="text-[10px] font-bold uppercase tracking-tight">Ends {new Date(offer.endDate).toLocaleDateString()}</span>
                            </div>
                            <Button className="rounded-xl bg-brand-red hover:bg-brand-red-dark font-bold shadow-lg shadow-brand-red/20">
                              Shop Deal
                            </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer Helper */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Need help using a coupon?</h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Just copy the code of your choice and paste it into the 'Apply Coupon' box during the checkout process to redeem your discount.
            </p>
            <div className="inline-flex items-center gap-6 p-1 rounded-2xl bg-white/5 border border-white/10 pr-6">
                <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center text-brand-red">
                    <AlertCircle size={24} />
                </div>
                <div className="text-left">
                    <p className="text-white font-bold text-sm">Pro Tip!</p>
                    <p className="text-gray-400 text-xs">Only one coupon can be applied per order.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
