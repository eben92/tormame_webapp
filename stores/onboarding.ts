"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingState {
  /** Selected city — required to complete onboarding. Survives logout. */
  city: string | null;
  /** Optional name captured during onboarding, used to prefill register. */
  name: string | null;
  /** Optional phone (E.164, +233…) captured during onboarding, used to prefill register. */
  phone: string | null;
  /** True once onboarding (full or city-only) has been completed. */
  hasOnboarded: boolean;
  hasHydrated: boolean;
  setCity: (city: string) => void;
  setProfileDraft: (draft: { name?: string; phone?: string }) => void;
  completeOnboarding: () => void;
  setState: (state: Partial<OnboardingState>) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      city: null,
      name: null,
      phone: null,
      hasOnboarded: false,
      hasHydrated: false,
      setCity: (city) => set({ city }),
      setProfileDraft: (draft) =>
        set((state) => ({
          name: draft.name !== undefined ? draft.name.trim() || null : state.name,
          phone:
            draft.phone !== undefined ? draft.phone.trim() || null : state.phone,
        })),
      completeOnboarding: () => set({ hasOnboarded: true }),
      setState: (state) => set(state),
    }),
    {
      name: "onboarding",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        city: state.city,
        name: state.name,
        phone: state.phone,
        hasOnboarded: state.hasOnboarded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setState({ hasHydrated: true });
      },
    },
  ),
);

/** Non-React access to the selected city (same pattern as getAccessToken). */
export const getSelectedCity = (): string | null =>
  useOnboardingStore.getState().city;
