import { QueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/api/errors";
import { clearUserStoreAndLogout } from "@/stores/user";

/**
 * Mirrors the mobile client's defaults: three retries, except an expired session
 * which logs out immediately rather than retrying its way to the same 401.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry(failureCount, error) {
          if (isUnauthorizedError(error)) {
            clearUserStoreAndLogout();
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError(error) {
          if (isUnauthorizedError(error)) {
            clearUserStoreAndLogout();
          }
        },
      },
    },
  });
}
