"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import type { SessionScores } from "@/lib/sessions"

interface KeyMomentsProps {
  keyMoments: SessionScores["keyMoments"]
}

export function KeyMoments({ keyMoments }: KeyMomentsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Strongest moment */}
      <motion.div
        className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
            Peak moment
          </p>
        </div>
        <blockquote className="mt-4 border-l-2 border-emerald-500/30 pl-3">
          <p className="text-sm italic leading-relaxed text-foreground/80">
            &ldquo;{keyMoments.strongest.quote}&rdquo;
          </p>
        </blockquote>
        <p className="mt-3 text-sm leading-relaxed text-foreground/60">
          {keyMoments.strongest.why}
        </p>
      </motion.div>

      {/* Weakest moment */}
      <motion.div
        className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-5"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
            Opportunity
          </p>
        </div>
        <blockquote className="mt-4 border-l-2 border-amber-500/30 pl-3">
          <p className="text-sm italic leading-relaxed text-foreground/80">
            &ldquo;{keyMoments.weakest.quote}&rdquo;
          </p>
        </blockquote>
        <p className="mt-3 text-sm leading-relaxed text-foreground/60">
          {keyMoments.weakest.why}
        </p>
      </motion.div>
    </div>
  )
}
