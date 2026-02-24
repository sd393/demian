"use client"

import { useState } from "react"
import { ChevronDown, Sparkles, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { RubricCriterion } from "@/lib/sessions"

interface RubricDetailProps {
  rubric: RubricCriterion[]
  strongestMoment: { quote: string; why: string }
  areaToImprove: { issue: string; suggestion: string }
}

const LEVELS = [
  {
    key: "exceptional" as const,
    label: "Exceptional",
    range: "85–100",
    dot: "bg-emerald-500",
    activeBg: "border-emerald-500/25 bg-emerald-500/[0.06]",
  },
  {
    key: "proficient" as const,
    label: "Proficient",
    range: "70–84",
    dot: "bg-sky-500",
    activeBg: "border-sky-500/25 bg-sky-500/[0.06]",
  },
  {
    key: "developing" as const,
    label: "Developing",
    range: "50–69",
    dot: "bg-amber-500",
    activeBg: "border-amber-500/25 bg-amber-500/[0.06]",
  },
  {
    key: "needsWork" as const,
    label: "Needs Work",
    range: "0–49",
    dot: "bg-red-500",
    activeBg: "border-red-500/25 bg-red-500/[0.06]",
  },
]

function getDesignation(score: number) {
  if (score >= 85) return { label: "Exceptional", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", key: "exceptional" as const }
  if (score >= 70) return { label: "Proficient", color: "bg-sky-500/15 text-sky-700 dark:text-sky-400", key: "proficient" as const }
  if (score >= 50) return { label: "Developing", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", key: "developing" as const }
  return { label: "Needs Work", color: "bg-red-500/15 text-red-700 dark:text-red-400", key: "needsWork" as const }
}

function CriterionCard({ criterion }: { criterion: RubricCriterion }) {
  const [open, setOpen] = useState(false)
  const designation = getDesignation(criterion.score)

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{criterion.name}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${designation.color}`}>
          {designation.label}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground/60">
          {criterion.score}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-5 py-4 space-y-3">
              <p className="text-sm leading-relaxed text-foreground/70">
                {criterion.summary}
              </p>
              {criterion.evidence.length > 0 && (
                <div className="space-y-2">
                  {criterion.evidence.map((quote, i) => (
                    <blockquote
                      key={i}
                      className="border-l-2 border-primary/20 pl-3 text-sm italic text-foreground/50"
                    >
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  ))}
                </div>
              )}

              {/* Scoring guide */}
              {criterion.descriptors && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/40 mb-2">
                    Scoring guide
                  </p>
                  {LEVELS.map((level) => {
                    const isActive = designation.key === level.key
                    return (
                      <div
                        key={level.key}
                        className={`rounded-lg px-3 py-2 ${
                          isActive ? `border ${level.activeBg}` : "border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${isActive ? level.dot : "bg-muted-foreground/20"}`} />
                          <span className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                            {level.label}
                          </span>
                          <span className="text-[10px] tabular-nums text-muted-foreground/30">
                            {level.range}
                          </span>
                        </div>
                        <p className={`mt-0.5 ml-3.5 text-xs leading-relaxed ${isActive ? "text-foreground/60" : "text-muted-foreground/30"}`}>
                          {criterion.descriptors![level.key]}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RubricDetail({ rubric, strongestMoment, areaToImprove }: RubricDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      {rubric.map((c) => (
        <CriterionCard key={c.name} criterion={c} />
      ))}

      {/* Accent cards */}
      <div className="grid gap-3 sm:grid-cols-2 pt-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500/70" />
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/80">
              Strongest moment
            </p>
          </div>
          <blockquote className="text-sm italic text-foreground/70">
            &ldquo;{strongestMoment.quote}&rdquo;
          </blockquote>
          <p className="mt-2 text-sm text-foreground/60">{strongestMoment.why}</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-amber-500/70" />
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600/80 dark:text-amber-400/80">
              Area to improve
            </p>
          </div>
          <p className="text-sm text-foreground/70">{areaToImprove.issue}</p>
          <p className="mt-2 text-sm text-foreground/60">{areaToImprove.suggestion}</p>
        </div>
      </div>
    </motion.div>
  )
}
