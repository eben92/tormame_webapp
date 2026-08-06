"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserProfileProps {
  id: string;
  email?: string;
  name?: string;
  msisdn?: string;
  image_url?: string;
}

export interface UserProps {
  access_token: string;
  refresh_token: string;
  profile: UserProfileProps;
}

interface UserStoreState {
  user: UserProps | null;
  /** Password-reset session handed back by the forgot-password endpoints. */
  session_id?: string;
  hasHydrated: boolean;
  setState: (state: Partial<UserStoreState>) => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      user: null,
      session_id: undefined,
      hasHydrated: false,
      setState: (state) => set(state),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
      // Hydration is triggered explicitly by StoreHydration so the first client
      // render matches the server's, then flips once with `hasHydrated`.
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        session_id: state.session_id,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setState({ hasHydrated: true });
      },
    },
  ),
);

export const getAccessToken = (): string | undefined =>
  useUserStore.getState().user?.access_token;

export const getRefreshToken = (): string | undefined =>
  useUserStore.getState().user?.refresh_token;

export const getUserProfile = (): UserProfileProps | undefined =>
  useUserStore.getState().user?.profile;

export const setTokens = (accessToken: string, refreshToken: string) => {
  const current = useUserStore.getState().user;
  if (!current) return;
  useUserStore.setState({
    user: {
      ...current,
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
};

export const clearSessionId = () => {
  useUserStore.setState({ session_id: undefined });
};

/** Drops the session everywhere: memory, storage, and any in-flight refresh. */
export const clearUserStoreAndLogout = () => {
  void useUserStore.persist.clearStorage();
  useUserStore.setState({ user: null, session_id: undefined });
};
