"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  /** packageKey — composite id used to dedupe identical product/variant/modifier picks. */
  id: string;
  productId: string;
  variantId?: string;
  parentName: string;
  parentImageUrl?: string;
  variantLabel?: string;
  name: string;
  /** Formatted unit price (base + variant + modifiers). */
  price: string;
  imageUrl?: string;
  isDigital?: boolean;
  modifierOptionIds?: number[];
  modifierSummary?: string;
  quantity: number;
}

export type CartItemInput = Omit<CartItem, "quantity">;

export function packageKey(
  productId: string,
  variantId?: string,
  modifierOptionIds?: number[],
): string {
  const mods = [...(modifierOptionIds ?? [])].sort((a, b) => a - b).join(",");
  return `${productId}::${variantId ?? "_"}::${mods}`;
}

export function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

export function formatCartTotal(items: CartItem[]): string {
  const total = items.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  );
  return `GH₵${total.toFixed(2)}`;
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

interface CartState {
  /** A basket belongs to exactly one store; adding from another clears it. */
  storeId: string | null;
  items: CartItem[];
  hasHydrated: boolean;
  addPackage: (storeId: string, input: CartItemInput, qty: number) => void;
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setState: (state: Partial<CartState>) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      storeId: null,
      items: [],
      hasHydrated: false,
      addPackage: (storeId, input, qty) =>
        set((state) => {
          const items = state.storeId !== storeId ? [] : [...state.items];
          const index = items.findIndex((item) => item.id === input.id);
          if (index !== -1) {
            items[index] = {
              ...items[index],
              quantity: items[index].quantity + qty,
            };
          } else {
            items.push({ ...input, quantity: qty });
          }
          return { storeId, items };
        }),
      incrementItem: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        })),
      decrementItem: (itemId) =>
        set((state) => {
          const items = state.items
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0);
          return { items, storeId: items.length === 0 ? null : state.storeId };
        }),
      removeItem: (itemId) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== itemId);
          return { items, storeId: items.length === 0 ? null : state.storeId };
        }),
      clearCart: () => set({ storeId: null, items: [] }),
      setState: (state) => set(state),
    }),
    {
      name: "cart-store-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ storeId: state.storeId, items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setState({ hasHydrated: true });
      },
    },
  ),
);
