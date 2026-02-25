/**
 * Shared utilities for client-side API calls.
 */

/**
 * Build standard headers for JSON API requests, optionally including an
 * Authorization bearer token.
 */
export function buildAuthHeaders(
  token?: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}
