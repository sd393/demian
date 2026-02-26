import { View, Text, StyleSheet } from "@react-pdf/renderer"
import { colors, fonts, fontSize } from "../theme"

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: fonts.sans,
    fontSize: fontSize.lg,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 10,
  },
  transcript: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    lineHeight: 1.6,
    color: colors.textMuted,
  },
})

interface PdfTranscriptProps {
  transcript: string
}

/** Full transcript in smaller gray text. Starts on a new page via break prop on the parent. */
export function PdfTranscript({ transcript }: PdfTranscriptProps) {
  return (
    <View break>
      <Text style={styles.sectionTitle}>Transcript</Text>
      <Text style={styles.transcript}>{transcript}</Text>
    </View>
  )
}
