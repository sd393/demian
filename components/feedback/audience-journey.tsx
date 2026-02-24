"use client"

import { motion } from "framer-motion"

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

const EMOTION_LABELS: Record<string, string> = {
  neutral: "Neutral",
  interested: "Interested",
  skeptical: "Skeptical",
  confused: "Confused",
  amused: "Amused",
  impressed: "Impressed",
  concerned: "Concerned",
  bored: "Disengaged",
}

interface AudienceJourneyProps {
  pulseLabels: { text: string; emotion: string }[]
}

export function AudienceJourney({ pulseLabels }: AudienceJourneyProps) {
  if (pulseLabels.length === 0) return null

  // Count emotions for distribution
  const emotionCounts = new Map<string, number>()
  for (const label of pulseLabels) {
    emotionCounts.set(label.emotion, (emotionCounts.get(label.emotion) ?? 0) + 1)
  }
  const sorted = [...emotionCounts.entries()].sort((a, b) => b[1] - a[1])
  const total = pulseLabels.length

  return (
    <div className="space-y-4">
      {/* Emotion distribution bars */}
      <div className="space-y-2.5">
        {sorted.map(([emotion, count]) => {
          const pct = Math.round((count / total) * 100)
          return (
            <div key={emotion} className="flex items-center gap-3">
              <span className="w-20 text-right text-xs font-medium text-muted-foreground">
                {EMOTION_LABELS[emotion] ?? emotion}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: EMOTION_COLORS[emotion] ?? EMOTION_COLORS.neutral }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="w-8 text-xs tabular-nums text-muted-foreground/60">{pct}%</span>
            </div>
          )
        })}
      </div>

      {/* Timeline of thoughts */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {pulseLabels.map((label, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-card px-2.5 py-1 text-[11px] text-foreground/60"
          >
            <span
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: EMOTION_COLORS[label.emotion] ?? EMOTION_COLORS.neutral }}
            />
            {label.text}
          </span>
        ))}
      </div>
    </div>
  )
}
