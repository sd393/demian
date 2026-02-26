import { View, StyleSheet } from "@react-pdf/renderer"
import { markdownToPdf } from "../markdown-to-pdf"

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
})

interface PdfFeedbackLetterProps {
  letter: string
}

/** Renders the feedbackLetter markdown as react-pdf elements. */
export function PdfFeedbackLetter({ letter }: PdfFeedbackLetterProps) {
  return (
    <View style={styles.container}>
      {markdownToPdf(letter)}
    </View>
  )
}
