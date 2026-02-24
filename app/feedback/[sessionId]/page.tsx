"use client"

import { useEffect, useState, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ChevronDown, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { getSession, type SessionDocument, type SessionScores } from "@/lib/sessions"
import { FeedbackHeader } from "@/components/feedback/feedback-header"
import { ScoreRadar } from "@/components/feedback/score-radar"
import { CategoryGrid } from "@/components/feedback/category-grid"
import { CategoryDetail } from "@/components/feedback/category-detail"
import { AudienceJourney } from "@/components/feedback/audience-journey"
import { KeyMoments } from "@/components/feedback/key-moments"
import { ActionItems } from "@/components/feedback/action-items"

const SCORE_POLL_INTERVAL = 3000
const SCORE_POLL_MAX_ATTEMPTS = 20

export default function FeedbackPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [session, setSession] = useState<(SessionDocument & { id: string }) | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pollCount = useRef(0)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [authLoading, user, router])

  // Load session data from Firestore
  useEffect(() => {
    if (!user) return

    async function load() {
      try {
        const data = await getSession(sessionId, user!.uid)
        if (!data) {
          setLoadError("Session not found")
          return
        }
        setSession(data)
      } catch (err) {
        console.error("[feedback] Failed to load session:", err)
        setLoadError("Failed to load session. Check that Firestore is enabled.")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [sessionId, user])

  // Poll for scores if missing
  useEffect(() => {
    if (!session || session.scores) return
    if (!user) return

    const interval = setInterval(async () => {
      pollCount.current++
      if (pollCount.current > SCORE_POLL_MAX_ATTEMPTS) {
        clearInterval(interval)
        return
      }

      try {
        const updated = await getSession(sessionId, user.uid)
        if (updated?.scores) {
          setSession(updated)
          clearInterval(interval)
        }
      } catch {
        // silently retry
      }
    }, SCORE_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [session, sessionId, user])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <p className="text-sm text-muted-foreground">Loading your report...</p>
        </div>
      </div>
    )
  }

  if (loadError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-foreground">{loadError ?? "Session not found"}</p>
        <a href="/chat" className="text-sm text-primary hover:underline">
          Back to chat
        </a>
      </div>
    )
  }

  const scores: SessionScores | null = session.scores

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -left-60 -top-60 h-[600px] w-[600px] rounded-full opacity-[0.07] blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(36 72% 50%), transparent 70%)" }}
        />
        <div
          className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full opacity-[0.04] blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(142 71% 45%), transparent 70%)" }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* ── Header with score ring ── */}
        <FeedbackHeader
          topic={session.setup.topic}
          audience={session.setup.audience}
          goal={session.setup.goal}
          date={session.createdAt?.toDate?.() ?? new Date()}
          overallScore={scores?.overall ?? null}
        />

        {/* ── Score content ── */}
        {scores ? (
          <div className="mt-12 space-y-12">

            {/* Section: Performance Breakdown */}
            <Section title="Performance Breakdown" delay={0}>
              <div className="rounded-xl border border-border/60 bg-card p-5">
                <ScoreRadar categories={scores.categories} />
              </div>
              <div className="mt-4">
                <CategoryGrid categories={scores.categories} />
              </div>
            </Section>

            {/* Section: Key Moments */}
            <Section title="Key Moments" delay={0.05}>
              <KeyMoments keyMoments={scores.keyMoments} />
            </Section>

            {/* Section: Audience Reaction (conditional) */}
            {session.audiencePulse.length > 0 && (
              <Section title="Audience Reaction" delay={0.1}>
                <div className="rounded-xl border border-border/60 bg-card p-5">
                  <AudienceJourney pulseLabels={session.audiencePulse} />
                </div>
              </Section>
            )}

            {/* Section: Detailed Analysis */}
            <Section title="Detailed Analysis" delay={0.15}>
              <CategoryDetail categories={scores.categories} />
            </Section>

            {/* Section: Next Steps */}
            <Section title="Next Steps" delay={0.2}>
              <ActionItems actionItems={scores.actionItems} />
            </Section>

            {/* Transcript (collapsible) */}
            {session.transcript && (
              <TranscriptSection transcript={session.transcript} />
            )}
          </div>
        ) : (
          /* Loading state while scores generate */
          <div className="mt-16">
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground/80">Analyzing your presentation</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vera is scoring your performance across 6 dimensions...
                </p>
              </div>
            </div>

            {/* Skeleton placeholders */}
            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-border/40 pt-8 text-center">
          <a
            href="/chat"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Start a new session
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Section wrapper with label + stagger ── */
function Section({
  title,
  delay = 0,
  children,
}: {
  title: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="mb-5 font-display text-xs font-semibold uppercase tracking-[0.15em] text-primary/70">
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

/* ── Collapsible transcript ── */
function TranscriptSection({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <FileText className="h-4 w-4 text-muted-foreground/50" />
        <span className="flex-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Transcript
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 max-h-96 overflow-y-auto rounded-xl border border-border/60 bg-card px-5 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/60">
            {transcript}
          </p>
        </div>
      )}
    </motion.section>
  )
}
