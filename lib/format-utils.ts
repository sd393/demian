import type { DeckFeedback, SlideFeedback } from '@/hooks/use-slide-review'

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function formatSlideContextForChat(deck: DeckFeedback, feedbacks: SlideFeedback[]): string {
  const lines: string[] = [
    `Deck: "${deck.deckTitle}"`,
    `Overall Score: ${deck.overallRating}/100`,
    `Audience Assumed: ${deck.audienceAssumed}`,
    ``,
    `Executive Summary:`,
    deck.executiveSummary,
    ``,
    `Top Priorities:`,
    ...(deck.topPriorities ?? []).map((p, i) => `${i + 1}. ${p}`),
    ``,
    `Slide-by-Slide Feedback:`,
  ]

  for (const f of feedbacks) {
    const ratingLabel = f.rating === 'needs-work' ? 'NEEDS WORK' : f.rating.toUpperCase()
    lines.push(``)
    lines.push(`Slide ${f.slideNumber}: "${f.title}" — ${ratingLabel}`)
    lines.push(`  ${f.headline}`)
    if (f.quote) lines.push(`  (Quote from slide: "${f.quote}")`)
    if ((f.strengths?.length ?? 0) > 0) {
      lines.push(`  Strengths:`)
      f.strengths.forEach((s) => lines.push(`    - ${s}`))
    }
    if ((f.improvements?.length ?? 0) > 0) {
      lines.push(`  Improvements:`)
      f.improvements.forEach((s) => lines.push(`    - ${s}`))
    }
  }

  return lines.join('\n')
}
