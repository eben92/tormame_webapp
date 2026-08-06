"use client";

import { create } from "zustand";
import type { FulfillmentType } from "@/lib/api/schemas/order";

export const DROPOFF_INSTRUCTION_OPTIONS = [
  "Leave at door",
  "Hand it to me",
  "Call upon arrival",
  "Leave with security/concierge",
] as const;

interface CheckoutState {
  fulfillmentType: FulfillmentType;
  dropoffInstruction: string | null;
  customInstruction: string;
  /** The branch that will fulfil this order. Null until branches load. */
  selectedBranchId: string | null;
  /** True once the customer picked a branch themselves, which outranks the computed default. */
  branchPickedExplicitly: boolean;
  setFulfillmentType: (type: FulfillmentType) => void;
  setDropoffInstruction: (instruction: string | null) => void;
  setCustomInstruction: (text: string) => void;
  selectBranch: (id: string) => void;
  setDefaultBranch: (id: string) => void;
  reset: () => void;
}

/** Deliberately not persisted — a basket survives a reload, these choices do not. */
export const useCheckoutStore = create<CheckoutState>()((set) => ({
  fulfillmentType: "DELIVERY",
  dropoffInstruction: null,
  customInstruction: "",
  selectedBranchId: null,
  branchPickedExplicitly: false,
  setFulfillmentType: (fulfillmentType) => set({ fulfillmentType }),
  setDropoffInstruction: (dropoffInstruction) =>
    set(
      dropoffInstruction
        ? { dropoffInstruction, customInstruction: "" }
        : { dropoffInstruction },
    ),
  setCustomInstruction: (customInstruction) =>
    set(
      customInstruction
        ? { customInstruction, dropoffInstruction: null }
        : { customInstruction },
    ),
  selectBranch: (id) =>
    set({ selectedBranchId: id, branchPickedExplicitly: true }),
  setDefaultBranch: (id) =>
    set({ selectedBranchId: id, branchPickedExplicitly: false }),
  reset: () =>
    set({
      fulfillmentType: "DELIVERY",
      dropoffInstruction: null,
      customInstruction: "",
      selectedBranchId: null,
      branchPickedExplicitly: false,
    }),
}));
