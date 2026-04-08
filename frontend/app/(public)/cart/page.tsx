'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

type PublicCoupon = {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
};

export default function CartPage() {
  const { items, totalAmount, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([]);

  const shippingCost = totalAmount >= 999 ? 0 : 60;
  const grandTotal = totalAmount + shippingCost - discount;

  useEffect(() => {
    let cancelled = false;

    const loadCoupons = async () => {
      try {
        const { data } = await api.get('/payment/public-coupons');
        if (cancelled) return;
        setPublicCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      } catch {
        if (cancelled) return;
        setPublicCoupons([]);
      }
    };

    void loadCoupons();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!appliedCoupon) return;

    let cancelled = false;
    const revalidateCoupon = async () => {
      try {
        const { data } = await api.post('/payment/validate-coupon', {
          code: appliedCoupon,
          orderAmount: totalAmount,
        });
        if (cancelled) return;
        setDiscount(data.discount);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('checkout-coupon', JSON.stringify({ code: appliedCoupon, discount: data.discount }));
        }
      } catch {
        if (cancelled) return;
        setDiscount(0);
        setAppliedCoupon('');
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('checkout-coupon');
        }
      }
    };

    void revalidateCoupon();

    return () => {
      cancelled = true;
    };
  }, [appliedCoupon, totalAmount]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post('/payment/validate-coupon', {
        code: couponCode,
        orderAmount: totalAmount,
      });
      setDiscount(data.discount);
      const code = couponCode.toUpperCase();
      setAppliedCoupon(code);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkout-coupon', JSON.stringify({ code, discount: data.discount }));
      }
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`);
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('checkout-coupon');
      }
      setDiscount(0);
      setAppliedCoupon('');
      toast.error(error.response?.data?.message || 'Invalid coupon');
    }
  };

  const typedCoupon = publicCoupons.find((coupon) => coupon.code.toLowerCase() === couponCode.trim().toLowerCase());
  const appliedCouponDetails = publicCoupons.find((coupon) => coupon.code.toLowerCase() === appliedCoupon.toLowerCase());

  const formatCouponSummary = (coupon?: PublicCoupon) => {
    if (!coupon) return '';

    const discountText =
      coupon.discountType === 'percent'
        ? `${coupon.discountValue}% off`
        : `${formatPrice(coupon.discountValue)} off`;

    const capText =
      coupon.discountType === 'percent' && coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0
        ? ` up to ${formatPrice(coupon.maxDiscountAmount)}`
        : '';

    return `${discountText}${capText}`;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet</p>
        <Button render={<Link href="/shop" />} className="bg-brand-red hover:bg-brand-red-dark">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product._id + (item.variant || '')} className="flex gap-4 border rounded-lg p-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.images?.[0]?.url && (
                  <Image src={item.product.images[0].url} alt={item.product.name} width={96} height={96} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-brand-red">
                  {item.product.name}
                </Link>
                {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                <p className="text-lg font-semibold text-brand-red mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateItemQuantity(item.product._id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 border-x text-sm">{item.quantity}</span>
                    <button onClick={() => updateItemQuantity(item.product._id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeFromCart(item.product._id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Link href="/shop" className="text-brand-red hover:underline flex items-center gap-1">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
            <Button variant="outline" size="sm" onClick={clearCart}>Clear Cart</Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

          {/* Coupon */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="h-9"
            />
            <Button size="sm" variant="outline" onClick={applyCoupon}>Apply</Button>
          </div>
          {typedCoupon && (
            <p className="text-xs text-gray-500 mb-2">
              {typedCoupon.code} gives {formatCouponSummary(typedCoupon)}
              {typedCoupon.minOrderAmount ? ` on orders over ${formatPrice(typedCoupon.minOrderAmount)}` : ''}
            </p>
          )}
          {appliedCoupon && (
            <p className="text-sm text-green-600 mb-4">
              Coupon &quot;{appliedCoupon}&quot; applied
              {appliedCouponDetails ? ` - ${formatCouponSummary(appliedCouponDetails)}` : ''}
            </p>
          )}

          <Separator className="mb-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-red">{formatPrice(grandTotal)}</span>
          </div>

            <Button className="w-full mt-6 bg-brand-red hover:bg-brand-red-dark" size="lg" render={<Link href="/checkout" />}>
              Proceed to Checkout
            </Button>

          {totalAmount < 999 && (
            <p className="text-xs text-center text-gray-500 mt-3">
              Add {formatPrice(999 - totalAmount)} more for free delivery!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
