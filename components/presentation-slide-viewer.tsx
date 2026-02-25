"use client"

import { useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { AnalysisProgress } from "@/hooks/use-slide-review"

interface PresentationSlideViewerProps {
  thumbnails: Record<number, string>
  currentSlide: number
  onSlideChange: (slide: number) => void
  progress: AnalysisProgress
}

export function PresentationSlideViewer({
  thumbnails,
  currentSlide,
  onSlideChange,
  progress,
}: PresentationSlideViewerProps) {
  const slideNumbers = Object.keys(thumbnails)
    .map(Number)
    .sort((a, b) => a - b)
  const totalSlides = slideNumbers.length
  const clampedSlide = Math.max(1, Math.min(currentSlide, totalSlides))

  const goNext = useCallback(() => {
    if (clampedSlide < totalSlides) onSlideChange(clampedSlide + 1)
  }, [clampedSlide, totalSlides, onSlideChange])

  const goPrev = useCallback(() => {
    if (clampedSlide > 1) onSlideChange(clampedSlide - 1)
  }, [clampedSlide, onSlideChange])

  // Keyboard navigation (Left/Right arrows)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev() }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev])

  if (totalSlides === 0) return null

  const isAnalyzing = progress.step !== "idle" && progress.step !== "done" && progress.step !== "error"

  return (
    <div className="flex h-full flex-col bg-background/50">
      {/* Current slide — fills available space */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {thumbnails[clampedSlide] && (
          <img
            src={thumbnails[clampedSlide]}
            alt={`Slide ${clampedSlide}`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
          />
        )}
      </div>

      {/* Navigation bar */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-border/60 px-4 py-2.5">
        <button
          type="button"
          onClick={goPrev}
          disabled={clampedSlide <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {clampedSlide} / {totalSlides}
          </span>
          {isAnalyzing && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={clampedSlide >= totalSlides}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnail strip */}
      {totalSlides > 1 && (
        <div className="flex flex-shrink-0 gap-1.5 overflow-x-auto border-t border-border/60 px-3 py-2">
          {slideNumbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onSlideChange(n)}
              className={`flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                n === clampedSlide
                  ? "border-primary/50 shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`Go to slide ${n}`}
            >
              <img
                src={thumbnails[n]}
                alt={`Slide ${n} thumbnail`}
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
