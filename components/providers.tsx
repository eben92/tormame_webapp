"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { makeQueryClient } from "@/lib/query-client";
import { useAddressStore } from "@/stores/address";
import { useCartStore } from "@/stores/cart";
import { useOnboardingStore } from "@/stores/onboarding";
import { useUserStore } from "@/stores/user";

/**
 * Persisted stores hydrate here rather than at module scope so the first client
 * render matches the server's markup, then flips once storage is read.
 */
function StoreHydration() {
  React.useEffect(() => {
    void useUserStore.persist.rehydrate();
    void useOnboardingStore.persist.rehydrate();
    void useCartStore.persist.rehydrate();
    void useAddressStore.persist.rehydrate();
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <StoreHydration />
        {children}
        <Toaster position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
