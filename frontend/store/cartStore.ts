import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images: { url: string }[];
    price: number;
    discountPrice?: number;
    stock: { quantity: number; status: string };
  };
  quantity: number;
  variant?: string;
  price: number;
}

interface CartStore {
  items: CartItem[];
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[], totalAmount: number) => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.findIndex(
            (i) => i.product._id === item.product._id && i.variant === item.variant
          );
          let newItems: CartItem[];
          if (existing > -1) {
            newItems = [...state.items];
            newItems[existing].quantity += item.quantity;
          } else {
            newItems = [...state.items, item];
          }
          const totalAmount = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { items: newItems, totalAmount };
        }),
      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.product._id !== productId);
          const totalAmount = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { items: newItems, totalAmount };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          const newItems = state.items.map((i) =>
            i.product._id === productId ? { ...i, quantity } : i
          );
          const totalAmount = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { items: newItems, totalAmount };
        }),
      clearCart: () => set({ items: [], totalAmount: 0 }),
      setCart: (items, totalAmount) => set({ items, totalAmount }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
