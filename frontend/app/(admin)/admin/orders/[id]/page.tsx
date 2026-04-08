'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  MapPin, 
  CreditCard, 
  Package, 
  User, 
  Truck, 
  Calendar, 
  DollarSign,
  Phone,
  Mail,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/orders/${id}`);
      setOrder(data.order);
      setTrackingId(data.order?.trackingId || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field: string, value: string) => {
    try {
      setUpdating(true);
      const { data } = await api.put(`/admin/orders/${id}`, { [field]: value });
      setOrder(data.order);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!order) return <div className="p-20 text-center">Order not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full h-10 w-10 p-0 border border-gray-100">
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order <span className="text-brand-red">#{order.orderNumber}</span></h1>
          <p className="text-xs text-gray-400 font-medium">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
             <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Manage Status</span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusColors[order.orderStatus]}`}>
                  {order.orderStatus}
                </span>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => handleUpdate('orderStatus', s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all
                      ${order.orderStatus === s ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                  >
                    {s}
                  </button>
                ))}
             </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Ordered Components</h3>
             </div>
             <table className="w-full text-sm">
                <thead>
                   <tr className="text-left text-[10px] uppercase font-bold text-gray-400 border-b border-gray-50">
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-right">Total</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {order.items?.map((item: any, i: number) => (
                      <tr key={i}>
                         <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{item.name}</div>
                            {item.variant && <div className="text-[10px] text-gray-400 italic">{item.variant}</div>}
                         </td>
                         <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                         <td className="px-6 py-4 text-right font-bold">৳{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
             <div className="p-6 bg-gray-50/20 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>৳{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Shipping</span>
                  <span>৳{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-xs text-amber-600 font-bold">
                    <span>Discount</span>
                    <span>-৳{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-4 mt-2">
                   <span>Grand Total</span>
                   <span>৳{formatPrice(order.totalAmount)}</span>
                </div>
             </div>
          </div>

          {/* Logistics Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
             <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Logistics & Tracking</h3>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Tracking ID..." 
                  className="flex-1 h-10 px-4 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
                <Button size="sm" onClick={() => handleUpdate('trackingId', trackingId)} disabled={updating}>Update ID</Button>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Profile */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-center">
             <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">
                {order.user?.name?.[0] || 'U'}
             </div>
             <div>
                <h2 className="text-lg font-bold">{order.user?.name || 'Customer'}</h2>
                <div className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Client Profile</div>
             </div>
             <div className="text-left space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs">
                   <Phone size={14} className="text-gray-300" />
                   <span className="font-semibold">{order.user?.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                   <Mail size={14} className="text-gray-300" />
                   <span className="font-semibold truncate">{order.user?.email || 'No email'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs">
                   <MapPin size={14} className="text-brand-red mt-0.5" />
                   <div className="font-semibold">
                      {order.shippingAddress?.address},<br/>
                      {order.shippingAddress?.area}, {order.shippingAddress?.district}
                   </div>
                </div>
             </div>
          </div>

          {/* Payment Status */}
          <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${order.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Payment Flow</span>
                  <span className="text-sm font-bold text-gray-900">{order.paymentMethod}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                   {order.paymentStatus}
                </span>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdate('paymentStatus', 'pending')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${order.paymentStatus === 'pending' ? 'bg-white border-white shadow-sm' : 'border-transparent text-gray-400'}`}
                >Pending</button>
                <button 
                  onClick={() => handleUpdate('paymentStatus', 'paid')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${order.paymentStatus === 'paid' ? 'bg-white border-white shadow-sm' : 'border-transparent text-gray-400'}`}
                >Mark Paid</button>
             </div>
          </div>

          {/* Delivery Note */}
          {order.deliveryNote && (
            <div className="bg-brand-black p-6 rounded-2xl text-white">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Customer Note</span>
              <p className="text-sm italic text-gray-300">"{order.deliveryNote}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
