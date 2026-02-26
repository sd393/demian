import { Text, View, StyleSheet } from "@react-pdf/renderer"
import type { ReactElement } from "react"
import { colors, fonts, fontSize } from "./theme"

const styles = StyleSheet.create({
  paragraph: {
    fontFamily: fonts.sans,
    fontSize: fontSize.base,
    lineHeight: 1.6,
    color: colors.text,
    marginBottom: 8,
  },
  heading1: {
    fontFamily: fonts.serif,
    fontSize: fontSize.xl,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 10,
    marginTop: 14,
  },
  heading2: {
    fontFamily: fonts.sans,
    fontSize: fontSize.lg,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  heading3: {
    fontFamily: fonts.sans,
    fontSize: fontSize.md,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
    marginLeft: 4,
    marginBottom: 8,
  },
  blockquoteText: {
    fontFamily: fonts.sans,
    fontSize: fontSize.base,
    fontStyle: "italic",
    lineHeight: 1.6,
    color: colors.textSecondary,
  },
  listItem: {
    flexDirection: "row" as const,
    marginBottom: 4,
    paddingLeft: 4,
  },
  listBullet: {
    fontFamily: fonts.sans,
    fontSize: fontSize.base,
    color: colors.primary,
    width: 14,
  },
  listContent: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: fontSize.base,
    lineHeight: 1.6,
    color: colors.text,
  },
  bold: {
    fontWeight: 700,
  },
  italic: {
    fontStyle: "italic" as const,
  },
})

/** Parse inline markdown (bold, italic) into react-pdf <Text> elements. */
export function parseInline(text: string): ReactElement[] {
  const elements: ReactElement[] = []
  // Match **bold**, *italic*, or plain text
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|([^*]+)/g
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      elements.push(
        <Text key={key++} style={styles.bold}>{match[2]}</Text>
      )
    } else if (match[4]) {
      // Italic
      elements.push(
        <Text key={key++} style={styles.italic}>{match[4]}</Text>
      )
    } else if (match[5]) {
      // Plain text
      elements.push(
        <Text key={key++}>{match[5]}</Text>
      )
    }
  }

  return elements
}

/** Classify a block of text by its leading markdown syntax. */
function classifyBlock(block: string): { type: string; content: string } {
  const trimmed = block.trim()
  if (trimmed.startsWith("### ")) return { type: "h3", content: trimmed.slice(4) }
  if (trimmed.startsWith("## ")) return { type: "h2", content: trimmed.slice(3) }
  if (trimmed.startsWith("# ")) return { type: "h1", content: trimmed.slice(2) }
  if (trimmed.startsWith("> ")) return { type: "blockquote", content: trimmed.slice(2) }
  if (/^[-*]\s/.test(trimmed)) return { type: "list-item", content: trimmed.slice(2) }
  if (/^\d+\.\s/.test(trimmed)) return { type: "list-item", content: trimmed.replace(/^\d+\.\s/, "") }
  return { type: "paragraph", content: trimmed }
}

/**
 * Convert a markdown string into an array of react-pdf elements.
 * Handles: paragraphs, headings (h1–h3), blockquotes, unordered/ordered lists,
 * and inline bold/italic.
 */
export function markdownToPdf(markdown: string): ReactElement[] {
  if (!markdown || !markdown.trim()) return []

  // Split on blank lines to get blocks, but also split individual lines
  // within a block to handle consecutive list items without blank lines
  const rawBlocks = markdown.split(/\n{2,}/)
  const elements: ReactElement[] = []
  let key = 0

  for (const rawBlock of rawBlocks) {
    const trimmed = rawBlock.trim()
    if (!trimmed) continue

    // Check if this block contains multiple lines that are each list items
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean)
    const allListItems = lines.length > 1 && lines.every((l) => /^[-*]\s/.test(l) || /^\d+\.\s/.test(l))

    if (allListItems) {
      for (const line of lines) {
        const { content } = classifyBlock(line)
        elements.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.listBullet}>{"\u2022"}</Text>
            <Text style={styles.listContent}>{parseInline(content)}</Text>
          </View>
        )
      }
      continue
    }

    // Also check if block has a heading followed by list items
    const firstLineClassified = classifyBlock(lines[0])
    if (lines.length > 1 && (firstLineClassified.type === "h1" || firstLineClassified.type === "h2" || firstLineClassified.type === "h3")) {
      // Render heading
      const headingStyle = firstLineClassified.type === "h1" ? styles.heading1 : firstLineClassified.type === "h2" ? styles.heading2 : styles.heading3
      elements.push(
        <Text key={key++} style={headingStyle}>{parseInline(firstLineClassified.content)}</Text>
      )
      // Render remaining lines
      for (let i = 1; i < lines.length; i++) {
        const sub = classifyBlock(lines[i])
        if (sub.type === "list-item") {
          elements.push(
            <View key={key++} style={styles.listItem}>
              <Text style={styles.listBullet}>{"\u2022"}</Text>
              <Text style={styles.listContent}>{parseInline(sub.content)}</Text>
            </View>
          )
        } else {
          elements.push(
            <Text key={key++} style={styles.paragraph}>{parseInline(sub.content)}</Text>
          )
        }
      }
      continue
    }

    const { type, content } = classifyBlock(trimmed)

    switch (type) {
      case "h1":
        elements.push(<Text key={key++} style={styles.heading1}>{parseInline(content)}</Text>)
        break
      case "h2":
        elements.push(<Text key={key++} style={styles.heading2}>{parseInline(content)}</Text>)
        break
      case "h3":
        elements.push(<Text key={key++} style={styles.heading3}>{parseInline(content)}</Text>)
        break
      case "blockquote":
        elements.push(
          <View key={key++} style={styles.blockquote}>
            <Text style={styles.blockquoteText}>{parseInline(content)}</Text>
          </View>
        )
        break
      case "list-item":
        elements.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.listBullet}>{"\u2022"}</Text>
            <Text style={styles.listContent}>{parseInline(content)}</Text>
          </View>
        )
        break
      default:
        elements.push(<Text key={key++} style={styles.paragraph}>{parseInline(content)}</Text>)
    }
  }

  return elements
}
