"use client"

import type { SessionScores } from "@/lib/sessions"

interface KeyMomentsProps {
  keyMoments: SessionScores["keyMoments"]
}

export function KeyMoments({ keyMoments }: KeyMomentsProps) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Key Moments
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Strongest moment */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Strongest Moment
          </p>
          <blockquote className="mt-3 border-l-2 border-emerald-500/30 pl-3 text-sm italic text-foreground/80">
            &ldquo;{keyMoments.strongest.quote}&rdquo;
          </blockquote>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            {keyMoments.strongest.why}
          </p>
        </div>

        {/* Weakest moment */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            Needs Work
          </p>
          <blockquote className="mt-3 border-l-2 border-amber-500/30 pl-3 text-sm italic text-foreground/80">
            &ldquo;{keyMoments.weakest.quote}&rdquo;
          </blockquote>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            {keyMoments.weakest.why}
          </p>
        </div>
      </div>
    </div>
  )
}
