import type { ZodType } from "zod";
import { ENV } from "@/lib/env";
import {
  clearUserStoreAndLogout,
  getAccessToken,
  getRefreshToken,
  setTokens,
  useUserStore,
} from "@/stores/user";
import { ApiError, ApiSchemaError } from "./errors";

/** Endpoints that must never trigger a token refresh — they establish the session. */
const NO_REFRESH_ENDPOINTS = [
  "/auth/signin",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/forgot-password",
  "/auth/forgot-password/request",
  "/auth/forgot-password/validate-otp",
  "/auth/forgot-password/resend-otp",
  "/logout",
];

let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchanges the refresh token for a new access token. Single-flight: concurrent
 * 401s share one request instead of racing each other into a logout.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${ENV.BACKEND_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) throw new Error("Failed to refresh token");

      const json = (await res.json()) as {
        data?: { access_token?: string; refresh_token?: string };
      };
      const newAccessToken = json?.data?.access_token;
      if (!newAccessToken) return null;

      setTokens(newAccessToken, json?.data?.refresh_token ?? refreshToken);
      return newAccessToken;
    } catch {
      clearUserStoreAndLogout();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type ApiFetchOptions<T> = Omit<RequestInit, "body"> & {
  /** Zod schema for the envelope's `data` field. The return type is inferred from it. */
  schema: ZodType<T>;
  /** Plain object — serialised as JSON. */
  body?: unknown;
};

/**
 * The single entry point to the backend.
 *
 * - attaches the bearer token
 * - unwraps the `{ data, status, message, timestamp }` envelope
 * - validates `data` against `schema`, so nothing unvalidated reaches the UI
 * - refreshes the access token once on a 401 and replays the request
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions<T>,
  retry = true,
): Promise<T> {
  const { schema, body, headers, ...init } = options;
  const token = getAccessToken();

  const response = await fetch(`${ENV.BACKEND_URL}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const isRefreshable =
    response.status === 401 &&
    retry &&
    !NO_REFRESH_ENDPOINTS.some((path) => endpoint.startsWith(path)) &&
    Boolean(useUserStore.getState().user);

  if (isRefreshable) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearUserStoreAndLogout();
      throw new ApiError("Session expired. Please log in again.", 401);
    }
    return apiFetch(endpoint, options, false);
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    throw new ApiError(
      errorBody?.message ??
        errorBody?.error ??
        `Request failed with status ${response.status}`,
      response.status,
    );
  }

  // 204 and empty bodies (DELETE) carry no envelope.
  const text = await response.text();
  if (!text) {
    const empty = schema.safeParse(undefined);
    if (empty.success) return empty.data;
    throw new ApiSchemaError(endpoint, "empty response body");
  }

  const json = JSON.parse(text) as { data?: unknown };
  const parsed = schema.safeParse(json?.data);

  if (!parsed.success) {
    throw new ApiSchemaError(
      endpoint,
      parsed.error.issues
        .slice(0, 3)
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; "),
    );
  }

  return parsed.data;
}
