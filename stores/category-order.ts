"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CategoryOrderState {
  /** Raw API labels (e.g. "FOOD") in the order the customer arranged them. */
  order: string[];
  hasHydrated: boolean;
  setOrder: (order: string[]) => void;
  setState: (state: Partial<CategoryOrderState>) => void;
}

export const useCategoryOrderStore = create<CategoryOrderState>()(
  persist(
    (set) => ({
      order: [],
      hasHydrated: false,
      setOrder: (order) => set({ order }),
      setState: (state) => set(state),
    }),
    {
      name: "category-order",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ order: state.order }),
      onRehydrateStorage: () => (state) => {
        state?.setState({ hasHydrated: true });
      },
    },
  ),
);
