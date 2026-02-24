"use client"

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

interface CategoryGridProps {
  categories: SessionScores["categories"]
}

function CategoryCard({ name, category }: { name: string; category: CategoryScore }) {
  const color = ratingColor(category.score)

  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{CATEGORY_LABELS[name] ?? name}</p>
        <span className="text-lg font-bold tabular-nums" style={{ color }}>
          {category.score}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {category.summary.split(". ")[0]}.
      </p>
    </div>
  )
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(categories).map(([key, cat]) => (
        <CategoryCard key={key} name={key} category={cat} />
      ))}
    </div>
  )
}
