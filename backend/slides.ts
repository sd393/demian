import fs from 'fs/promises'
import { extractText } from 'unpdf'
import { tempPath } from '@/backend/audio'

export interface SlideText {
  slideNumber: number
  text: string
}

export interface SlideFeedback {
  slideNumber: number
  title: string
  rating: 'strong' | 'needs-work' | 'critical'
  headline: string
  strengths: string[]
  improvements: string[]
  quote?: string
}

export interface DeckFeedback {
  deckTitle: string
  audienceAssumed: string
  overallRating: number
  executiveSummary: string
  slides: SlideFeedback[]
  topPriorities: string[]
}

export const MAX_SLIDES = 30

export function slidesTempPath(ext: string): string {
  return tempPath(ext, 'vera-slides')
}

/**
 * Extract text content from each page of a PDF.
 * Uses unpdf which works in serverless Node.js (no browser APIs needed).
 * Caps at MAX_SLIDES pages.
 */
export async function extractSlideTexts(pdfPath: string): Promise<SlideText[]> {
  const pdfBuffer = await fs.readFile(pdfPath)
  const { totalPages, text: pages } = await extractText(
    new Uint8Array(pdfBuffer),
    { mergePages: false }
  )

  const pageCount = Math.min(totalPages, MAX_SLIDES)
  return pages.slice(0, pageCount).map((text, i) => ({
    slideNumber: i + 1,
    text: text.trim() || '[No text content on this slide]',
  }))
}
