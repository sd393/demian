"use client"

import { useState, useCallback, useEffect } from "react"
import { listSessions, type SessionSummary } from "@/lib/sessions"

interface UseSessionHistoryOptions {
  userId: string | null
}

export function useSessionHistory({ userId }: UseSessionHistoryOptions) {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const results = await listSessions(userId)
      setSessions(results)
    } catch (err) {
      console.error("[useSessionHistory]", err)
      setError("Failed to load sessions.")
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Fetch on mount when userId is available
  useEffect(() => {
    if (userId) {
      refresh()
    }
  }, [userId, refresh])

  return { sessions, loading, error, refresh }
}
