import { describe, it, expect } from "vitest"

// We test the pure parsing logic. The react-pdf components are tested
// via their props/types rather than rendering, since react-pdf needs
// a full PDF rendering context.

// Import the block classifier and inline parser indirectly through the module
// Since classifyBlock is not exported, we test through markdownToPdf output structure
// and test parseInline directly.

import { parseInline, markdownToPdf } from "@/components/feedback/pdf/markdown-to-pdf"

describe("parseInline", () => {
  it("returns plain text for no formatting", () => {
    const result = parseInline("Hello world")
    expect(result).toHaveLength(1)
  })

  it("parses bold text", () => {
    const result = parseInline("This is **bold** text")
    expect(result).toHaveLength(3)
    // First element is "This is ", second is bold "bold", third is " text"
  })

  it("parses italic text", () => {
    const result = parseInline("This is *italic* text")
    expect(result).toHaveLength(3)
  })

  it("parses mixed bold and italic", () => {
    const result = parseInline("**bold** and *italic*")
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  it("handles text with no markdown", () => {
    const result = parseInline("just plain text")
    expect(result).toHaveLength(1)
  })

  it("handles empty string", () => {
    const result = parseInline("")
    expect(result).toHaveLength(0)
  })
})

describe("markdownToPdf", () => {
  it("returns empty array for empty input", () => {
    expect(markdownToPdf("")).toHaveLength(0)
  })

  it("returns empty array for whitespace-only input", () => {
    expect(markdownToPdf("   \n  \n  ")).toHaveLength(0)
  })

  it("parses a single paragraph", () => {
    const result = markdownToPdf("Hello world")
    expect(result).toHaveLength(1)
  })

  it("parses multiple paragraphs separated by blank lines", () => {
    const result = markdownToPdf("First paragraph\n\nSecond paragraph")
    expect(result).toHaveLength(2)
  })

  it("parses h1 heading", () => {
    const result = markdownToPdf("# Title")
    expect(result).toHaveLength(1)
  })

  it("parses h2 heading", () => {
    const result = markdownToPdf("## Subtitle")
    expect(result).toHaveLength(1)
  })

  it("parses h3 heading", () => {
    const result = markdownToPdf("### Section")
    expect(result).toHaveLength(1)
  })

  it("parses blockquote", () => {
    const result = markdownToPdf("> This is a quote")
    expect(result).toHaveLength(1)
  })

  it("parses unordered list items", () => {
    const result = markdownToPdf("- First\n- Second\n- Third")
    expect(result).toHaveLength(3)
  })

  it("parses ordered list items", () => {
    const result = markdownToPdf("1. First\n2. Second\n3. Third")
    expect(result).toHaveLength(3)
  })

  it("handles heading followed by list items without blank line", () => {
    const result = markdownToPdf("## Section\n- Item 1\n- Item 2")
    // Should produce a heading + 2 list items = 3 elements
    expect(result).toHaveLength(3)
  })

  it("handles mixed content", () => {
    const md = `# Title

A paragraph with **bold** text.

> A blockquote

- Item one
- Item two`
    const result = markdownToPdf(md)
    // h1, paragraph, blockquote, 2 list items = 5
    expect(result).toHaveLength(5)
  })

  it("handles paragraphs without blank lines as single block", () => {
    // Lines without blank lines between them get treated as one block
    const result = markdownToPdf("Line one\nLine two")
    // This is a single block, rendered as one paragraph
    expect(result).toHaveLength(1)
  })
})
