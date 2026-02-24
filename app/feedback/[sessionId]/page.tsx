"use client"

import { useEffect, useState, useRef, use } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { ChevronDown, Loader2 } from "lucide-react"
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

  // Load session data
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
      } catch {
        setLoadError("Failed to load session")
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loadError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-foreground">{loadError ?? "Session not found"}</p>
        <a href="/chat" className="text-sm text-primary hover:underline">
          Back to chat
        </a>
      </div>
    )
  }

  const scores: SessionScores | null = session.scores
  const feedbackMessage = session.messages
    .filter((m) => m.role === "assistant" && m.content.length > 100)
    .pop()

  return (
    <div className="relative min-h-screen px-4 py-12 sm:px-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-[0.08] blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(36 72% 50%), transparent 70%)" }}
        />
        <div
          className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full opacity-[0.05] blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(34 50% 68%), transparent 70%)" }}
        />
      </div>

      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <FeedbackHeader
          topic={session.setup.topic}
          audience={session.setup.audience}
          goal={session.setup.goal}
          date={session.createdAt?.toDate?.() ?? new Date()}
          overallScore={scores?.overall ?? null}
        />

        {/* Score sections — show loading skeleton while scores are pending */}
        {scores ? (
          <>
            {/* Radar + Grid */}
            <ScoreRadar categories={scores.categories} />
            <CategoryGrid categories={scores.categories} />

            {/* Audience Journey */}
            {session.audiencePulse.length > 0 && (
              <AudienceJourney pulseLabels={session.audiencePulse} />
            )}

            {/* Deep Dives */}
            <CategoryDetail categories={scores.categories} />

            {/* Key Moments */}
            <KeyMoments keyMoments={scores.keyMoments} />

            {/* Action Items */}
            <ActionItems actionItems={scores.actionItems} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
            <p className="text-sm text-muted-foreground">Generating detailed scores...</p>
          </div>
        )}

        {/* Qualitative Feedback */}
        {feedbackMessage && (
          <CollapsibleSection title="Qualitative Feedback" defaultOpen>
            <div className="prose prose-sm max-w-none text-[0.9375rem] leading-[1.7] text-foreground/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-foreground/70 [&_strong]:text-foreground [&_blockquote]:border-primary/20 [&_blockquote]:text-foreground/70 [&_li]:marker:text-primary/40">
              <ReactMarkdown>{feedbackMessage.content}</ReactMarkdown>
            </div>
          </CollapsibleSection>
        )}

        {/* Transcript */}
        {session.transcript && (
          <CollapsibleSection title="Transcript" defaultOpen={false}>
            <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/70">
                {session.transcript}
              </p>
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-border/60 px-5 pb-5 pt-4">{children}</div>}
    </div>
  )
}
