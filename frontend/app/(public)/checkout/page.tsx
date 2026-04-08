'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';
import Link from 'next/link';

const DHAKA_DISTRICTS = ['dhaka', 'gazipur', 'narayanganj', 'manikganj', 'munshiganj', 'narsingdi'];
const DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    area: '',
    district: '',
    division: 'Dhaka',
  });
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('checkout-coupon');
      if (stored) {
        setCoupon(JSON.parse(stored));
      }
    } catch {
      sessionStorage.removeItem('checkout-coupon');
    }
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to continue</h1>
        <Button render={<Link href="/login" />} className="bg-brand-red hover:bg-brand-red-dark">
          Login
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button render={<Link href="/shop" />} className="bg-brand-red hover:bg-brand-red-dark">
          Shop Now
        </Button>
      </div>
    );
  }

  const normalizedDistrict = form.district.trim().toLowerCase();
  const normalizedDivision = form.division.trim().toLowerCase();
  const isDhaka = normalizedDivision === 'dhaka' || DHAKA_DISTRICTS.includes(normalizedDistrict);
  const shippingCost = totalAmount >= 999 ? 0 : isDhaka ? 60 : 120;
  const couponDiscount = coupon?.discount || 0;
  const grandTotal = totalAmount + shippingCost - couponDiscount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.area || !form.district) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url || '',
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
      }));

      const { data } = await api.post('/orders', {
        shippingAddress: form,
        paymentMethod,
        deliveryNote,
        items: orderItems,
        couponCode: coupon?.code,
      });

      if (paymentMethod === 'SSLCommerz') {
        const { data: paymentData } = await api.post('/payment/sslcommerz/init', {
          orderId: data.order._id,
        });
        if (paymentData.url) {
          window.location.href = paymentData.url;
          return;
        }
        throw new Error('Payment gateway initialization failed.');
      }

      clearCart();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('checkout-coupon');
      }
      router.push(`/order-success?orderId=${data.order._id}&orderNumber=${encodeURIComponent(data.order.orderNumber)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880" required />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address *</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House/Road/Area details" required />
                </div>
                <div>
                  <Label>Area *</Label>
                  <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
                </div>
                <div>
                  <Label>District *</Label>
                  <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g., Dhaka" required />
                </div>
                <div>
                  <Label>Division</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md text-sm"
                    value={form.division}
                    onChange={(e) => setForm({ ...form, division: e.target.value })}
                  >
                    {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Delivery Note (optional)</Label>
                  <Textarea value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} placeholder="Any special instructions..." />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                  { value: 'SSLCommerz', label: 'Online Payment (SSLCommerz)', desc: 'Visa, Mastercard, bKash, Nagad, and more' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                      paymentMethod === method.value ? 'border-brand-red bg-brand-red-light' : 'hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-6 h-fit sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <span className="truncate mr-2">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-red">{formatPrice(grandTotal)}</span>
            </div>
            <Button
              type="submit"
              className="w-full mt-6 bg-brand-red hover:bg-brand-red-dark"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
