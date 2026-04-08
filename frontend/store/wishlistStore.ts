import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: { url: string }[];
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  setWishlist: (items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i._id === item._id)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i._id !== id) })),
      isInWishlist: (id) => get().items.some((i) => i._id === id),
      clearWishlist: () => set({ items: [] }),
      setWishlist: (items) => set({ items }),
    }),
    { name: 'wishlist-storage' }
  )
);
