"use client"

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import { ArrowLeft, Users, Target, Calendar } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

function ratingColor(score: number): string {
  if (score >= 75) return "hsl(142 71% 45%)"
  if (score >= 50) return "hsl(36 56% 48%)"
  return "hsl(0 84% 60%)"
}

function ratingLabel(score: number): string {
  if (score >= 85) return "Exceptional"
  if (score >= 75) return "Strong"
  if (score >= 60) return "Good"
  if (score >= 50) return "Average"
  return "Needs Work"
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
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        New session
      </Link>

      {/* Hero section */}
      <div className="flex flex-col items-center text-center">
        {/* Score ring — large and prominent */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {score !== null ? (
            <div className="relative">
              <RadialBarChart
                width={160}
                height={160}
                innerRadius="70%"
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
                  cornerRadius={8}
                  background={{ fill: "hsl(var(--muted))" }}
                  fill={color}
                />
              </RadialBarChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tabular-nums tracking-tight" style={{ color }}>
                  {score}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {ratingLabel(score)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-[6px] border-muted">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-[10px] text-muted-foreground">Scoring</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Topic */}
        <motion.h1
          className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {topic}
        </motion.h1>

        {/* Meta pills */}
        <motion.div
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {audience}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            {goal}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </motion.div>
      </div>
    </div>
  )
}
