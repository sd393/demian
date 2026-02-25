"use client"

import { useState, useEffect } from "react"
import { ChevronDown, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { DeckSummaryCard } from "@/components/deck-summary-card"
import { SlideFeedbackCard } from "@/components/slide-feedback-card"
import type { SlideReviewData } from "@/lib/sessions"

interface SlideReviewSectionProps {
  slideReview: SlideReviewData
}

export function SlideReviewSection({ slideReview }: SlideReviewSectionProps) {
  const [open, setOpen] = useState(false)
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({})

  // Lazily render thumbnails from blob URL if available
  useEffect(() => {
    if (!open || !slideReview.blobUrl) return

    let cancelled = false
    import("@/lib/pdf-thumbnails")
      .then(({ renderPdfThumbnails }) => renderPdfThumbnails(slideReview.blobUrl!))
      .then((t) => {
        if (!cancelled) setThumbnails(t)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [open, slideReview.blobUrl])

  const hasFeedbacks = slideReview.slideFeedbacks.length > 0
  const hasDeckSummary = !!slideReview.deckSummary

  if (!hasFeedbacks && !hasDeckSummary) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <FileText className="h-4 w-4 text-muted-foreground/50" />
        <span className="flex-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Slide Deck Review
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 space-y-4 rounded-xl border border-border/60 bg-card px-5 py-5">
          {hasDeckSummary && <DeckSummaryCard summary={slideReview.deckSummary!} />}
          {slideReview.slideFeedbacks.map((f) => (
            <SlideFeedbackCard
              key={f.slideNumber}
              feedback={f}
              thumbnail={thumbnails[f.slideNumber]}
            />
          ))}
        </div>
      )}
    </motion.section>
  )
}
