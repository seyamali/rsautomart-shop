'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';
import Link from 'next/link';

const DHAKA_DISTRICTS = ['dhaka', 'gazipur', 'narayanganj', 'manikganj', 'munshiganj', 'narsingdi'];
const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace(/^\+?880/, '') || '',
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/shop" className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition">
          Shop Now
        </Link>
      </div>
    );
  }

  const normalizedDistrict = form.district.trim().toLowerCase();
  const normalizedDivision = form.division.trim().toLowerCase();
  const isDhaka = normalizedDivision === 'dhaka' || DHAKA_DISTRICTS.includes(normalizedDistrict);
  
  // Hardened logic: Free shipping over 999, else 60/120
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
        shippingAddress: { ...form, phone: `+880${form.phone}` },
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
    <div className="min-h-screen bg-gray-50 py-8 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {!user && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start sm:items-center gap-3 shadow-sm">
            <span className="text-xl">🎁</span>
            <p className="text-sm text-gray-700">
              <strong>Checking out as guest.</strong>{' '}
              <Link href="/login" className="text-red-600 font-semibold hover:underline decoration-2 underline-offset-2">Sign in</Link> or{' '}
              <Link href="/register" className="text-red-600 font-semibold hover:underline decoration-2 underline-offset-2">create an account</Link> to earn loyalty bonus points on this order!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 text-left">
          {/* Left: Shipping + Payment */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 overflow-hidden transition-colors">
                    <span className="bg-gray-100 px-3 py-2 text-gray-500 text-sm border-r border-gray-300 flex items-center">+880</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="w-full px-3 py-2 focus:outline-none border-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="House/Road/Area details" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className={inputCls} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area <span className="text-red-500">*</span></label>
                  <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required className={inputCls} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g., Dhaka" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required className={inputCls} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <select
                    value={form.division}
                    onChange={(e) => setForm({ ...form, division: e.target.value })}
                    className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note (optional)</label>
                  <textarea
                    rows={2}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Any special instructions..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
              <div className="space-y-4">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                  { value: 'SSLCommerz', label: 'Online Payment (SSLCommerz)', desc: 'Visa, Mastercard, bKash, Nagad, and more' },
                ].map((m) => {
                  const active = paymentMethod === m.value;
                  return (
                    <label
                      key={m.value}
                      className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-colors ${
                        active ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.value}
                        checked={active}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <span className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${active ? 'border-red-500 bg-red-600' : 'border-gray-300 bg-white'}`}>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="ml-4 flex flex-col">
                        <span className="block text-sm font-semibold text-gray-900">{m.label}</span>
                        <span className="block text-sm text-gray-500">{m.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 border-b border-gray-100 pb-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-start text-sm text-gray-700">
                    <span className="pr-4">{item.product.name} x{item.quantity}</span>
                    <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping {form.district.trim() ? `(${isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})` : ''}</span>
                  <span className="font-medium text-gray-900">
                    {form.district.trim() ? formatPrice(shippingCost) : '—'}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-red-600">{formatPrice(grandTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 shadow-md disabled:opacity-60"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
