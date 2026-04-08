'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, Ticket } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalAmount, removeFromCart, updateItemQuantity } = useCart();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="px-6 pt-10 pb-4 border-b border-gray-100">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-brand-black">
            <ShoppingBag size={20} className="text-brand-red" />
            Cart ({items.length} items)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <ShoppingBag size={48} className="text-gray-200" />
            <p className="text-gray-500 font-medium text-sm">Your cart is empty</p>
            <Button onClick={onClose} render={<Link href="/shop" />} className="bg-brand-black text-white hover:bg-brand-red mt-2">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-custom space-y-4 py-4 px-6">
              {items.map((item) => (
                <div key={item.product._id + (item.variant || '')} className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images?.[0]?.url && (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-sm font-medium line-clamp-2 hover:text-brand-red"
                      onClick={onClose}
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                    )}
                    <p className="text-sm font-semibold text-brand-red mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateItemQuantity(item.product._id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center border rounded-md hover:bg-gray-100 active:bg-gray-200"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateItemQuantity(item.product._id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center border rounded-md hover:bg-gray-100 active:bg-gray-200"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.product._id)}
                        className="ml-auto w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="py-4 space-y-3 px-6 pb-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-between font-bold text-lg text-brand-black mb-1">
                <span>Total</span>
                <span className="text-brand-red">{formatPrice(totalAmount)}</span>
              </div>
              <Button
                className="w-full bg-brand-red text-white hover:bg-brand-red-dark font-semibold py-5"
                render={<Link href="/checkout" />}
                onClick={onClose}
              >
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full font-semibold text-brand-black hover:bg-gray-100" onClick={onClose} render={<Link href="/cart" />}>
                View Full Cart
              </Button>
              <div className="text-center">
                <Link 
                  href="/offers" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-red hover:underline decoration-2 underline-offset-4"
                  onClick={onClose}
                >
                  <Ticket size={14} />
                  Check for Coupons & Offers
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
