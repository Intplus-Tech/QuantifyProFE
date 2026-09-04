interface FieldError {
  field?: string;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, FieldError[]>;
}

/**
 * Flatten an API error into something a user can act on.
 *
 * The backend answers validation failures with a generic "Validation failed"
 * message and puts the detail in `errors.body[]` / `errors.params[]`, so
 * reading `message` alone throws away the only useful part.
 */
export function describeApiError(error: unknown, fallback: string): string {
  const data = (error as { data?: ApiErrorBody } | undefined)?.data;
  if (!data) return (error as Error)?.message ?? fallback;

  const fields = Object.values(data.errors ?? {})
    .flat()
    .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
    .filter(Boolean);

  if (fields.length > 0) return fields.join(" · ");
  return data.message ?? fallback;
}

/**
 * The server's own success message, so toasts echo the API rather than
 * inventing their own wording.
 */
export function apiMessage(response: unknown, fallback: string): string {
  const message = (response as { message?: string } | undefined)?.message;
  return typeof message === "string" && message.length > 0 ? message : fallback;
}

/** Mongo ObjectId shape — guards calls that would 400 on a placeholder id. */
export const isValidObjectId = (id: string | null | undefined): id is string =>
  typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
