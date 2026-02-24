"use client"

import { motion } from "framer-motion"
import type { SessionScores } from "@/lib/sessions"

interface ActionItemsProps {
  actionItems: SessionScores["actionItems"]
}

export function ActionItems({ actionItems }: ActionItemsProps) {
  return (
    <div className="space-y-3">
      {actionItems.map((item, i) => (
        <motion.div
          key={i}
          className="flex items-start gap-4 rounded-xl border border-border/60 bg-card px-5 py-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-bold text-primary">{item.priority}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  item.impact === "high"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.impact} impact
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
