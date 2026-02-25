import { MAX_WINDOW_MS } from '@/backend/rate-limit-config'

const requests = new Map<string, number[]>()

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean } {
  const now = Date.now()
  const timestamps = requests.get(identifier) ?? []

  // Keep only timestamps within the window
  const recent = timestamps.filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    requests.set(identifier, recent)
    return { allowed: false }
  }

  recent.push(now)
  requests.set(identifier, recent)
  return { allowed: true }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'anonymous'
}

/* ── Periodic cleanup ── */

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

function evictStaleEntries() {
  const now = Date.now()
  for (const [key, timestamps] of requests) {
    const recent = timestamps.filter((t) => now - t < MAX_WINDOW_MS)
    if (recent.length === 0) {
      requests.delete(key)
    } else {
      requests.set(key, recent)
    }
  }
}

// Run cleanup periodically. `.unref()` ensures the timer doesn't keep the
// process alive when all other work is done (e.g. during graceful shutdown).
const cleanupTimer = setInterval(evictStaleEntries, CLEANUP_INTERVAL_MS)
if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
  cleanupTimer.unref()
}
