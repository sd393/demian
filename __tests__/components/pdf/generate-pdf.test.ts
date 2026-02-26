import { describe, it, expect, vi, beforeEach } from "vitest"
import { sanitizeFilename } from "@/components/feedback/pdf/generate-pdf"

// Mock @react-pdf/renderer since it requires a browser/node rendering context
vi.mock("@react-pdf/renderer", () => ({
  pdf: vi.fn(() => ({
    toBlob: vi.fn(() => Promise.resolve(new Blob(["test"], { type: "application/pdf" }))),
  })),
  Document: "Document",
  Page: "Page",
  View: "View",
  Text: "Text",
  StyleSheet: { create: (s: Record<string, unknown>) => s },
  Font: { register: vi.fn() },
}))

describe("sanitizeFilename", () => {
  it("returns name unchanged when already clean", () => {
    expect(sanitizeFilename("My Presentation")).toBe("My Presentation")
  })

  it("removes unsafe characters", () => {
    expect(sanitizeFilename('My <bad> file: "name"')).toBe("My bad file name")
  })

  it("collapses multiple spaces", () => {
    expect(sanitizeFilename("Too   many    spaces")).toBe("Too many spaces")
  })

  it("trims whitespace", () => {
    expect(sanitizeFilename("  leading and trailing  ")).toBe("leading and trailing")
  })

  it("truncates to 80 characters", () => {
    const longName = "A".repeat(100)
    expect(sanitizeFilename(longName)).toHaveLength(80)
  })

  it("falls back to 'report' for empty string", () => {
    expect(sanitizeFilename("")).toBe("report")
  })

  it("falls back to 'report' for string that becomes empty after sanitization", () => {
    expect(sanitizeFilename(':::"')).toBe("report")
  })

  it("removes null bytes and control characters", () => {
    expect(sanitizeFilename("test\x00\x01name")).toBe("testname")
  })

  it("handles forward and back slashes", () => {
    expect(sanitizeFilename("path/to\\file")).toBe("pathtofile")
  })

  it("handles pipe and question mark", () => {
    expect(sanitizeFilename("what? | this")).toBe("what this")
  })
})

describe("generatePdfReport", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("creates a download link and clicks it", async () => {
    // Mock DOM APIs
    const mockClick = vi.fn()
    const mockAppendChild = vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node)
    const mockRemoveChild = vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node)
    const mockCreateObjectURL = vi.fn(() => "blob:test-url")
    const mockRevokeObjectURL = vi.fn()
    globalThis.URL.createObjectURL = mockCreateObjectURL
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL

    const mockAnchor = {
      href: "",
      download: "",
      click: mockClick,
    }
    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as unknown as HTMLElement)

    const { generatePdfReport } = await import("@/components/feedback/pdf/generate-pdf")

    await generatePdfReport({
      scores: {
        feedbackLetter: "Test letter",
        rubric: [{ name: "Test", score: 80, summary: "Good", evidence: [] }],
        strongestMoment: { quote: "Great!", why: "Because" },
        areaToImprove: { issue: "Fix this", suggestion: "Do that" },
        refinedTitle: "Test Presentation",
      },
      setup: { topic: "Topic", audience: "Audience", goal: "Goal" },
      transcript: null,
      date: new Date("2025-01-15"),
    })

    expect(mockClick).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalled()
  })
})
