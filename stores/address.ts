"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Address, LocalAddress } from "@/lib/api/schemas/account";

interface AddressSelectionState {
  selectedAddressId: string | null;
  /** An address typed at checkout but never saved to the account. */
  localAddress: LocalAddress | null;
  isLocalSelected: boolean;
  hasHydrated: boolean;
  selectAddress: (id: string) => void;
  setLocalAddress: (input: LocalAddress) => void;
  selectLocalAddress: () => void;
  clearLocalAddress: () => void;
  setState: (state: Partial<AddressSelectionState>) => void;
}

export const useAddressStore = create<AddressSelectionState>()(
  persist(
    (set) => ({
      selectedAddressId: null,
      localAddress: null,
      isLocalSelected: false,
      hasHydrated: false,
      selectAddress: (id) =>
        set({ selectedAddressId: id, isLocalSelected: false }),
      setLocalAddress: (input) =>
        set({
          localAddress: input,
          isLocalSelected: true,
          selectedAddressId: null,
        }),
      selectLocalAddress: () =>
        set({ isLocalSelected: true, selectedAddressId: null }),
      clearLocalAddress: () =>
        set({ localAddress: null, isLocalSelected: false }),
      setState: (state) => set(state),
    }),
    {
      name: "address-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        selectedAddressId: state.selectedAddressId,
        localAddress: state.localAddress,
        isLocalSelected: state.isLocalSelected,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setState({ hasHydrated: true });
      },
    },
  ),
);

export type ResolvedAddress =
  | { source: "saved"; address: Address }
  | { source: "local"; address: LocalAddress };

export function resolveSelectedAddress(
  backendAddresses: Address[],
  selectedAddressId: string | null,
  localAddress: LocalAddress | null,
  isLocalSelected: boolean,
): ResolvedAddress | null {
  if (isLocalSelected && localAddress) {
    return { source: "local", address: localAddress };
  }
  const saved = backendAddresses.find((a) => a.id === selectedAddressId);
  if (saved) return { source: "saved", address: saved };
  return null;
}
