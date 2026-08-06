import "server-only";

import type { ZodType } from "zod";
import { ENV } from "@/lib/env";
import { ApiError, ApiSchemaError } from "@/lib/api/errors";

/**
 * Server-side twin of `apiFetch`, for the public catalog endpoints only.
 *
 * It deliberately carries no bearer token: the session lives in `localStorage`
 * (mirroring the mobile app), so the server can never speak for a customer.
 * Anything account-scoped stays on the client.
 *
 * Same envelope unwrapping and Zod validation as the client, so a schema drift
 * fails the same way in both places.
 */
export async function serverFetch<T>(
  endpoint: string,
  schema: ZodType<T>,
): Promise<T> {
  const response = await fetch(`${ENV.BACKEND_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
  });

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

  const json = (await response.json()) as { data?: unknown };
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

/**
 * Prerendering must not depend on the backend being up. Every server-side read
 * goes through this: on failure the page renders its skeleton and the client
 * query takes over, which is exactly what happened before any of this existed.
 */
export async function tolerant<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}
