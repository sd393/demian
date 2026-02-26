import { View, Text, StyleSheet } from "@react-pdf/renderer"
import { colors, fonts, fontSize } from "../theme"

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
  },
  boxLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  quote: {
    fontFamily: fonts.sans,
    fontSize: fontSize.sm,
    fontStyle: "italic",
    lineHeight: 1.5,
    color: colors.text,
    marginBottom: 4,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: fontSize.sm,
    lineHeight: 1.5,
    color: colors.textSecondary,
  },
})

interface PdfHighlightsProps {
  strongestMoment: { quote: string; why: string }
  areaToImprove: { issue: string; suggestion: string }
}

/** Two side-by-side boxes: strongest moment (emerald) and area to improve (amber). */
export function PdfHighlights({ strongestMoment, areaToImprove }: PdfHighlightsProps) {
  return (
    <View style={styles.container} wrap={false}>
      {/* Strongest moment */}
      <View style={[styles.box, { borderColor: colors.exceptional, backgroundColor: colors.exceptionalBg }]}>
        <Text style={[styles.boxLabel, { color: colors.exceptional }]}>
          Strongest Moment
        </Text>
        <Text style={styles.quote}>&ldquo;{strongestMoment.quote}&rdquo;</Text>
        <Text style={styles.body}>{strongestMoment.why}</Text>
      </View>

      {/* Area to improve */}
      <View style={[styles.box, { borderColor: colors.developing, backgroundColor: colors.developingBg }]}>
        <Text style={[styles.boxLabel, { color: colors.developing }]}>
          Area to Improve
        </Text>
        <Text style={styles.body}>{areaToImprove.issue}</Text>
        <Text style={[styles.body, { marginTop: 4 }]}>{areaToImprove.suggestion}</Text>
      </View>
    </View>
  )
}
