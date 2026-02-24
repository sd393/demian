"use client"

import type { CategoryScore, SessionScores } from "@/lib/sessions"
import { motion } from "framer-motion"

function ratingColor(score: number): string {
  if (score >= 75) return "hsl(142 71% 45%)"
  if (score >= 50) return "hsl(36 56% 48%)"
  return "hsl(0 84% 60%)"
}

function ratingBg(score: number): string {
  if (score >= 75) return "bg-emerald-500/8"
  if (score >= 50) return "bg-primary/5"
  return "bg-red-500/5"
}

const CATEGORY_LABELS: Record<string, string> = {
  clarity: "Clarity",
  structure: "Structure",
  engagement: "Engagement",
  persuasiveness: "Persuasion",
  audienceAlignment: "Audience Fit",
  delivery: "Delivery",
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  clarity: "How clear and understandable your message was",
  structure: "How well-organized your flow and progression was",
  engagement: "How well you held your audience's attention",
  persuasiveness: "How convincing your arguments and evidence were",
  audienceAlignment: "How well-tailored your content was to this audience",
  delivery: "How effective your speaking style, pacing, and tone were",
}

interface CategoryGridProps {
  categories: SessionScores["categories"]
}

function CategoryCard({ name, category, index }: { name: string; category: CategoryScore; index: number }) {
  const color = ratingColor(category.score)
  const bg = ratingBg(category.score)

  // Score bar width
  const barWidth = Math.max(4, category.score)

  return (
    <motion.div
      className={`rounded-xl border border-border/60 ${bg} p-4`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[name] ?? name}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/70">
            {CATEGORY_DESCRIPTIONS[name]}
          </p>
        </div>
        <span className="flex-shrink-0 text-2xl font-bold tabular-nums leading-none" style={{ color }}>
          {category.score}
        </span>
      </div>

      {/* Score bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  )
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(categories).map(([key, cat], i) => (
        <CategoryCard key={key} name={key} category={cat} index={i} />
      ))}
    </div>
  )
}
