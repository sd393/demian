"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
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
    <div className="rounded-xl border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tabular-nums" style={{ color }}>
            {category.score}
          </span>
          <span className="text-sm font-medium text-foreground">
            {CATEGORY_LABELS[name] ?? name}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-border/60 px-5 pb-5 pt-4">
          <p className="text-sm leading-relaxed text-foreground/80">{category.summary}</p>

          {category.evidence.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Evidence
              </p>
              {category.evidence.map((quote, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 border-primary/20 pl-3 text-sm italic text-foreground/70"
                >
                  &ldquo;{quote}&rdquo;
                </blockquote>
              ))}
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Suggestion
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">
              {category.suggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function CategoryDetail({ categories }: CategoryDetailProps) {
  // Open the two lowest-scoring categories by default (most actionable)
  const sorted = Object.entries(categories).sort(([, a], [, b]) => a.score - b.score)
  const lowestTwo = new Set(sorted.slice(0, 2).map(([key]) => key))

  return (
    <div>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Category Deep Dives
      </h2>
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
    </div>
  )
}
