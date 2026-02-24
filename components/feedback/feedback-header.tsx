"use client"

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function ratingColor(score: number): string {
  if (score >= 75) return "hsl(142 71% 45%)"
  if (score >= 50) return "hsl(36 56% 48%)"
  return "hsl(0 84% 60%)"
}

interface FeedbackHeaderProps {
  topic: string
  audience: string
  goal: string
  date: Date
  overallScore: number | null
}

export function FeedbackHeader({ topic, audience, goal, date, overallScore }: FeedbackHeaderProps) {
  const score = overallScore !== null ? Math.max(0, Math.min(100, overallScore)) : null
  const chartData = score !== null ? [{ value: score }] : []
  const color = score !== null ? ratingColor(score) : "hsl(var(--muted))"

  return (
    <div>
      <Link
        href="/chat"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to chat
      </Link>

      <div className="flex items-start gap-5">
        {/* Score ring */}
        {score !== null ? (
          <div className="relative flex-shrink-0">
            <RadialBarChart
              width={96}
              height={96}
              innerRadius="62%"
              outerRadius="100%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                background={{ fill: "hsl(var(--muted))" }}
                fill={color}
              />
            </RadialBarChart>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold tabular-nums" style={{ color }}>
                {score}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 border-muted">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {topic}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audience: {audience} &middot; Goal: {goal}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
