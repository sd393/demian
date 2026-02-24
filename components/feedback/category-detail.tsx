"use client"

import { useState } from "react"
import { ChevronDown, Lightbulb, Quote } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { CategoryScore, SessionScores } from "@/lib/sessions"

function ratingColor(score: number): string {
  if (score >= 75) return "hsl(142 71% 45%)"
  if (score >= 50) return "hsl(36 56% 48%)"
  return "hsl(0 84% 60%)"
}

const CATEGORY_LABELS: Record<string, string> = {
  clarity: "Clarity",
  structure: "Structure",
  engagement: "Engagement",
  persuasiveness: "Persuasion",
  audienceAlignment: "Audience Fit",
  delivery: "Delivery",
}

interface CategoryDetailProps {
  categories: SessionScores["categories"]
}

function CategoryAccordion({
  name,
  category,
  defaultOpen,
}: {
  name: string
  category: CategoryScore
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const color = ratingColor(category.score)

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <span className="text-base font-bold tabular-nums" style={{ color }}>
            {category.score}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {CATEGORY_LABELS[name] ?? name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {category.summary.split(". ")[0]}.
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-border/60 px-5 pb-5 pt-4 space-y-5">
              {/* Summary */}
              <p className="text-sm leading-relaxed text-foreground/80">{category.summary}</p>

              {/* Evidence quotes */}
              {category.evidence.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Quote className="h-3 w-3 text-muted-foreground/50" />
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      From your presentation
                    </p>
                  </div>
                  {category.evidence.map((quote, i) => (
                    <div
                      key={i}
                      className="rounded-lg border-l-2 border-primary/30 bg-primary/[0.03] px-4 py-2.5"
                    >
                      <p className="text-sm italic leading-relaxed text-foreground/70">
                        &ldquo;{quote}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestion */}
              <div className="flex gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/60" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/60">
                    How to improve
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {category.suggestion}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CategoryDetail({ categories }: CategoryDetailProps) {
  // Open the two lowest-scoring categories by default
  const sorted = Object.entries(categories).sort(([, a], [, b]) => a.score - b.score)
  const lowestTwo = new Set(sorted.slice(0, 2).map(([key]) => key))

  return (
    <div className="space-y-3">
      {Object.entries(categories).map(([key, cat]) => (
        <CategoryAccordion
          key={key}
          name={key}
          category={cat}
          defaultOpen={lowestTwo.has(key)}
        />
      ))}
    </div>
  )
}
