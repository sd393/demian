"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { CoachingStage } from "@/lib/coaching-stages"

const STAGE_LABELS: Partial<Record<CoachingStage, string>> = {
  present: "Presenting",
  qa: "Q&A",
  feedback: "Feedback",
}

interface StageIndicatorProps {
  stage: CoachingStage
}

export function StageIndicator({ stage }: StageIndicatorProps) {
  const label = STAGE_LABELS[stage]

  return (
    <AnimatePresence mode="wait">
      {label && (
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex justify-center pb-2"
        >
          <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-0.5 text-[11px] font-medium tracking-wide text-primary/60">
            {label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
