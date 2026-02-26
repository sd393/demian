import { View, Text, StyleSheet } from "@react-pdf/renderer"
import { colors, fonts, fontSize } from "../theme"

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: fontSize.xxl,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
})

interface PdfHeaderSectionProps {
  title: string
  audience: string
  goal: string
  date: Date
}

/** First-page title block: presentation title, audience, goal, date. */
export function PdfHeaderSection({ title, audience, goal, date }: PdfHeaderSectionProps) {
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.tag}>{audience}</Text>
        <Text style={styles.tag}>{goal}</Text>
        <Text style={styles.tag}>{formattedDate}</Text>
      </View>
    </View>
  )
}
