"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Clock } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ChatNavbar } from "@/components/chat-navbar"
import { CoachingInterface } from "@/components/coaching-interface"
import { SessionHistorySidebar } from "@/components/session-history-sidebar"
import { useSessionHistory } from "@/hooks/use-session-history"

function ChatContent() {
  const { user, loading, plan, refreshSubscription } = useAuth()
  const [idToken, setIdToken] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const searchParams = useSearchParams()
  const { sessions, loading: sessionsLoading, error: sessionsError, refresh: refreshSessions } =
    useSessionHistory({ userId: user?.uid ?? null })

  const handleHistoryToggle = useCallback(() => {
    if (!historyOpen) refreshSessions()
    setHistoryOpen((prev) => !prev)
  }, [historyOpen, refreshSessions])

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken)
    } else {
      setIdToken(null)
    }
  }, [user])

  // Handle post-checkout success: verify the session server-side, then refresh local state
  useEffect(() => {
    if (loading) return // wait for auth to resolve before verifying
    if (searchParams.get("checkout") !== "success") return
    const sessionId = searchParams.get("session_id")

    async function verifyCheckout() {
      if (user && sessionId) {
        try {
          const token = await user.getIdToken()
          const res = await fetch("/api/verify-checkout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionId }),
          })

          if (!res.ok) {
            console.error("Checkout verification failed:", await res.text())
          }
        } catch (err) {
          console.error("Checkout verification error:", err)
        }
      }

      await refreshSubscription()
      toast.success("Welcome to Pro! You now have unlimited access.")
      window.history.replaceState({}, "", "/chat")
    }

    verifyCheckout()
  }, [searchParams, refreshSubscription, user, loading])

  if (loading || (user && !idToken)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const isTrialMode = !user

  return (
    <div className="flex h-screen flex-col">
      <ChatNavbar
        isTrialMode={isTrialMode}
        plan={plan}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <SessionHistorySidebar
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          sessions={sessions}
          loading={sessionsLoading}
          error={sessionsError}
        />
        <CoachingInterface
          authToken={isTrialMode ? null : idToken}
          isTrialMode={isTrialMode}
        />
      </div>
      {/* Floating history button — bottom left */}
      {!isTrialMode && (
        <button
          type="button"
          onClick={handleHistoryToggle}
          className={`fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition-all active:scale-[0.98] ${
            historyOpen
              ? "border-primary/20 bg-primary/[0.03] text-foreground"
              : "border-border/40 bg-background/90 text-muted-foreground/50 hover:border-primary/20 hover:bg-primary/[0.03] hover:text-primary/70"
          }`}
          aria-label="Session history"
          aria-pressed={historyOpen}
        >
          <Clock className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
