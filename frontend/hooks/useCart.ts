'use client';

import { useCartStore, CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import api from '@/lib/api';

export function useCart() {
  const { items, totalAmount, addItem, removeItem, updateQuantity, clearCart, getItemCount, setCart } =
    useCartStore();
  const user = useAuthStore((s) => s.user);

  const addToCart = (product: any, quantity = 1, variant?: string) => {
    if (product.stock?.status === 'out_of_stock') {
      toast.error('Product is out of stock');
      return;
    }

    const price = product.discountPrice || product.price;
    const item: CartItem = {
      _id: product._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
      },
      quantity,
      variant,
      price,
    };

    addItem(item);
    toast.success('Added to cart');

    // Sync to DB if logged in (fire-and-forget)
    if (user) {
      api.post('/cart/add', { productId: product._id, quantity, variant }).catch(() => {});
    }
  };

  const removeFromCart = (productId: string) => {
    removeItem(productId);
    toast.success('Removed from cart');

    if (user) {
      api.delete(`/cart/remove/${productId}`).catch(() => {});
    }
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    updateQuantity(productId, quantity);

    if (user) {
      api.put('/cart/update', { productId, quantity }).catch(() => {});
    }
  };

  return {
    items,
    totalAmount,
    itemCount: getItemCount(),
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    setCart,
  };
}
