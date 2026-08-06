import { STRINGS } from "@/lib/strings";

export type ApiErrorKind = "offline" | "server" | "client";

/** Error thrown by `apiFetch` for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number;
  /**
   * True when a 401 means "this request was refused", not "your session is
   * gone" — e.g. change-password answers 401 for a wrong current password.
   * Those must never clear the session.
   */
  readonly isDomainError: boolean;

  constructor(message: string, status: number, isDomainError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isDomainError = isDomainError;
  }
}

/** Thrown when a response body does not match its Zod schema. */
export class ApiSchemaError extends Error {
  readonly endpoint: string;

  constructor(endpoint: string, issues: string) {
    super(`Unexpected response from ${endpoint}: ${issues}`);
    this.name = "ApiSchemaError";
    this.endpoint = endpoint;
  }
}

/** fetch rejects with TypeError when the network is unreachable. */
export function classifyApiError(err: unknown): ApiErrorKind {
  if (err instanceof TypeError) return "offline";
  const status = (err as { status?: number } | null)?.status;
  if (typeof status === "number" && status >= 500) return "server";
  return "client";
}

export function getErrorCopy(err: unknown): { title: string; message: string } {
  switch (classifyApiError(err)) {
    case "offline":
      return {
        title: STRINGS.errors.offlineTitle,
        message: STRINGS.errors.offlineMessage,
      };
    case "server":
      return {
        title: STRINGS.errors.serverTitle,
        message: STRINGS.errors.serverMessage,
      };
    default: {
      const rawMessage = err instanceof Error ? err.message : undefined;
      const isTechnicalMessage =
        rawMessage && /^Request failed with status \d+$/.test(rawMessage);
      const message =
        rawMessage && !isTechnicalMessage
          ? rawMessage
          : STRINGS.errors.genericMessage;
      return { title: STRINGS.errors.genericTitle, message };
    }
  }
}

/** A 401 that really does mean the session is over, so the app should log out. */
export function isUnauthorizedError(err: unknown): boolean {
  if (err instanceof ApiError) return err.status === 401 && !err.isDomainError;
  return err instanceof Error && err.message.toLowerCase() === "unauthorized";
}
