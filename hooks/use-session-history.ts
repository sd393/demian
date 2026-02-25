"use client"

import { useState, useCallback, useEffect } from "react"
import { listSessions, deleteSession, type SessionSummary } from "@/lib/sessions"

interface UseSessionHistoryOptions {
  userId: string | null
  getAuthToken: () => Promise<string>
}

export function useSessionHistory({ userId, getAuthToken }: UseSessionHistoryOptions) {
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

  const removeSession = useCallback(async (sessionId: string) => {
    const previous = sessions
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    try {
      const token = await getAuthToken()
      await deleteSession(sessionId, token)
    } catch (err) {
      setSessions(previous)
      refresh()
      throw err
    }
  }, [getAuthToken, sessions, refresh])

  return { sessions, loading, error, refresh, removeSession }
}
