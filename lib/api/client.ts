import type { ZodType } from "zod";
import { ENV } from "@/lib/env";
import {
  RECAPTCHA_ACTION_HEADER,
  RECAPTCHA_TOKEN_HEADER,
  getRecaptchaToken,
} from "@/lib/recaptcha";
import {
  clearUserStoreAndLogout,
  getAccessToken,
  getRefreshToken,
  setTokens,
  useUserStore,
} from "@/stores/user";
import { ApiError, ApiSchemaError } from "./errors";

/**
 * Endpoints where a 401 is the answer, not a verdict on the session:
 * change-password refuses a wrong current password with 401. Refreshing and
 * retrying there is pointless, and treating it as an expired session would log
 * the customer out for a typo.
 */
const DOMAIN_401_ENDPOINTS = ["/me/change-password"];

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

/**
 * Endpoints that carry a reCAPTCHA token, with the action reported alongside
 * it: everything a bot would want to hammer — the session endpoints, order
 * creation, and the public payment lookup, which needs no session at all.
 *
 * Matching is by prefix and lives here rather than at the call sites, so a new
 * caller of an endpoint on this list is covered without remembering to ask.
 * The backend does the verifying; until it does, the header is simply ignored.
 */
const RECAPTCHA_ACTIONS: ReadonlyArray<readonly [string, string]> = [
  ["/auth/signin", "signin"],
  ["/auth/register", "register"],
  ["/auth/forgot-password/request", "forgot_password_request"],
  ["/auth/forgot-password/resend-otp", "forgot_password_resend"],
  ["/auth/forgot-password/validate-otp", "forgot_password_validate"],
  ["/auth/forgot-password", "forgot_password_reset"],
  ["/orders/payment-redirect", "payment_verification"],
  ["/orders", "create_order"],
];

function resolveRecaptchaAction(endpoint: string): string | undefined {
  return RECAPTCHA_ACTIONS.find(([prefix]) => endpoint.startsWith(prefix))?.[1];
}

type ApiFetchOptions<T> = Omit<RequestInit, "body"> & {
  /** Zod schema for the envelope's `data` field. The return type is inferred from it. */
  schema: ZodType<T>;
  /** Plain object — serialised as JSON. */
  body?: unknown;
  /**
   * Overrides the action `RECAPTCHA_ACTIONS` would pick for this endpoint.
   * Rarely needed: the list already covers the endpoints that want a token.
   */
  recaptchaAction?: string;
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
  const { schema, body, headers, recaptchaAction, ...init } = options;
  const token = getAccessToken();

  const action = recaptchaAction ?? resolveRecaptchaAction(endpoint);
  const recaptchaToken = action ? await getRecaptchaToken(action) : null;

  const response = await fetch(`${ENV.BACKEND_URL}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(recaptchaToken && action
        ? {
            [RECAPTCHA_TOKEN_HEADER]: recaptchaToken,
            [RECAPTCHA_ACTION_HEADER]: action,
          }
        : {}),
      ...(headers ?? {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const isDomain401 = DOMAIN_401_ENDPOINTS.some((path) =>
    endpoint.startsWith(path),
  );

  const isRefreshable =
    response.status === 401 &&
    retry &&
    !isDomain401 &&
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
      isDomain401,
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
