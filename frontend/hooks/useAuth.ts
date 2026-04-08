'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, logout: storeLogout } = useAuthStore();

  const syncCartWithServer = async (userTokens: any) => {
    try {
      const localItems = useCartStore.getState().items;
      if (localItems.length > 0) {
        // Guest had items — merge them into the DB cart
        const { data } = await api.post('/cart/sync', { localItems }, {
          headers: { Authorization: `Bearer ${userTokens}` }
        });
        useCartStore.getState().setCart(data.cart.items, data.cart.totalAmount);
      } else {
        // No guest items — load the user's DB cart
        const { data } = await api.get('/cart', {
          headers: { Authorization: `Bearer ${userTokens}` }
        });
        if (data.cart?.items) {
          useCartStore.getState().setCart(data.cart.items, data.cart.totalAmount);
        } else {
          useCartStore.getState().clearCart();
        }
      }
    } catch {
      useCartStore.getState().clearCart();
    }
  };

  const syncWishlistFromServer = async (userTokens: any) => {
    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${userTokens}` }
      });
      if (data.user?.wishlist) {
        useWishlistStore.getState().setWishlist(data.user.wishlist);
      }
    } catch {}
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuth(data.user, data.token);
    await Promise.all([
      syncCartWithServer(data.token),
      syncWishlistFromServer(data.token),
    ]);
    toast.success('Logged in successfully');
    if (data.user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, phone, password });
    setAuth(data.user, data.token);
    await Promise.all([
      syncCartWithServer(data.token),
      syncWishlistFromServer(data.token),
    ]);
    toast.success('Account created successfully');
    router.push('/');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    storeLogout();
    // Clear cart and wishlist so next user who logs in doesn't see this user's data
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();
    toast.success('Logged out');
    router.push('/');
  };

  return { user, token, login, register, logout, isLoggedIn: !!user, isAdmin: user?.role === 'admin' };
}
