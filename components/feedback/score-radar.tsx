"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import type { SessionScores } from "@/lib/sessions"

const CATEGORY_LABELS: Record<string, string> = {
  clarity: "Clarity",
  structure: "Structure",
  engagement: "Engagement",
  persuasiveness: "Persuasion",
  audienceAlignment: "Audience Fit",
  delivery: "Delivery",
}

interface ScoreRadarProps {
  categories: SessionScores["categories"]
}

export function ScoreRadar({ categories }: ScoreRadarProps) {
  const data = Object.entries(categories).map(([key, cat]) => ({
    category: CATEGORY_LABELS[key] ?? key,
    score: cat.score,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid
          stroke="hsl(var(--border))"
          strokeOpacity={0.4}
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          dataKey="score"
          stroke="hsl(36 72% 50%)"
          fill="hsl(36 72% 50%)"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(36 72% 50%)", strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
