/**
 * Safely extracts a user-facing error message from unknown error types.
 * Handles axios-like errors (response.data.message) and standard Error instances.
 */
export function getErrorMessage(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  if (err instanceof Error && err.message) return err.message;
  const withResponse = err as { response?: { data?: { message?: string } } };
  return withResponse?.response?.data?.message ?? null;
}
