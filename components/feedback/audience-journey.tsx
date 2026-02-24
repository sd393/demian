"use client"

const EMOTION_COLORS: Record<string, string> = {
  neutral: "hsl(var(--muted-foreground))",
  interested: "hsl(36 72% 50%)",
  skeptical: "hsl(280 60% 55%)",
  confused: "hsl(200 70% 55%)",
  amused: "hsl(45 90% 55%)",
  impressed: "hsl(142 71% 45%)",
  concerned: "hsl(0 84% 60%)",
  bored: "hsl(var(--muted-foreground) / 0.5)",
}

interface AudienceJourneyProps {
  pulseLabels: { text: string; emotion: string }[]
}

export function AudienceJourney({ pulseLabels }: AudienceJourneyProps) {
  if (pulseLabels.length === 0) return null

  // Find dominant emotion
  const emotionCounts = new Map<string, number>()
  for (const label of pulseLabels) {
    emotionCounts.set(label.emotion, (emotionCounts.get(label.emotion) ?? 0) + 1)
  }
  const dominant = [...emotionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "neutral"

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Audience Emotional Journey
        </h2>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
          style={{ backgroundColor: EMOTION_COLORS[dominant] ?? EMOTION_COLORS.neutral }}
        >
          {dominant}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pulseLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: EMOTION_COLORS[label.emotion] ?? EMOTION_COLORS.neutral }}
            />
            <span className="text-xs text-foreground/70">{label.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
