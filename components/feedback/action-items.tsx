"use client"

import type { SessionScores } from "@/lib/sessions"

interface ActionItemsProps {
  actionItems: SessionScores["actionItems"]
}

export function ActionItems({ actionItems }: ActionItemsProps) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Action Items
      </h2>
      <div className="space-y-3">
        {actionItems.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-5 py-4">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {item.priority}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    item.impact === "high"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.impact}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/70">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
