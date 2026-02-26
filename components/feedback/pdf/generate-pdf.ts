import { pdf } from "@react-pdf/renderer"
import { createElement } from "react"
import { registerFonts } from "./fonts"
import { PdfReport, type PdfReportProps } from "./pdf-document"

/**
 * Sanitize a string for use as a filename.
 * Removes unsafe characters, collapses whitespace, and truncates.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")  // remove unsafe chars
    .replace(/\s+/g, " ")                      // collapse whitespace
    .trim()
    .slice(0, 80)                              // reasonable length
    || "report"                                // fallback
}

/**
 * Generate a PDF report and trigger a browser download.
 * Registers fonts, renders the document to a blob, then downloads it.
 */
export async function generatePdfReport(props: PdfReportProps): Promise<void> {
  registerFonts()

  const doc = createElement(PdfReport, props)
  const blob = await pdf(doc).toBlob()

  const title = props.scores.refinedTitle ?? props.setup.topic
  const filename = `${sanitizeFilename(title)} — Vera Report.pdf`

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  // Cleanup
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
