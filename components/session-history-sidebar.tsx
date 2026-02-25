"use client"

import Link from "next/link"
import { History, Inbox, AlertCircle, X, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { SessionSummary } from "@/lib/sessions"

/* ── Session card ── */

function SessionCard({
  session,
  onDelete,
}: {
  session: SessionSummary
  onDelete?: (id: string) => void
}) {
  return (
    <Link
      href={`/feedback/${session.id}`}
      className="group relative flex items-start gap-3 rounded-lg border border-border/40 p-3 transition-all hover:border-primary/20 hover:bg-primary/[0.03] active:scale-[0.98]"
    >
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(session.id)
          }}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="Delete session"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-foreground/90">
          {session.topic}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="max-w-[10rem] truncate rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {session.audience}
          </span>
          {session.goal && (
            <span className="max-w-[10rem] truncate rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {session.goal}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
          {session.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  )
}

/* ── Loading skeletons ── */

function SessionCardSkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-3">
          <Skeleton className="h-4 w-3/4" />
          <div className="mt-2 flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

/* ── Empty state ── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-medium text-muted-foreground">
        No sessions yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Complete a coaching session to see it here.
      </p>
    </div>
  )
}

/* ── Error state ── */

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-10 w-10 text-destructive/50" />
      <p className="mt-3 text-sm text-destructive">{message}</p>
    </div>
  )
}

/* ── Main sidebar ── */

interface SessionHistorySidebarProps {
  open: boolean
  onClose: () => void
  sessions: SessionSummary[]
  loading: boolean
  error: string | null
  onDelete?: (id: string) => void
}

export function SessionHistorySidebar({
  open,
  onClose,
  sessions,
  loading,
  error,
  onDelete,
}: SessionHistorySidebarProps) {
  if (!open) return null

  return (
    <aside className="absolute inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-border/50 bg-background/95 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Past Sessions</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-3 py-3">
        {loading ? (
          <SessionCardSkeletons />
        ) : error ? (
          <ErrorState message={error} />
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} onDelete={onDelete} />
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
