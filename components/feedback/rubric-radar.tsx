"use client"

import { motion } from "framer-motion"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import type { RubricCriterion } from "@/lib/sessions"

interface RubricRadarProps {
  rubric: RubricCriterion[]
}

/** Wraps long axis labels onto multiple lines so they don't get clipped. */
function WrappedTick({ x, y, payload, textAnchor }: {
  x: number
  y: number
  payload: { value: string }
  textAnchor: string
}) {
  const MAX_LINE = 16
  const words = payload.value.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > MAX_LINE && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="hsl(var(--muted-foreground))"
      fontSize={11}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

export function RubricRadar({ rubric }: RubricRadarProps) {
  const data = rubric.map((c) => ({
    criterion: c.name,
    score: c.score,
    fullMark: 100,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex justify-center"
    >
      <div className="h-[380px] w-full max-w-[460px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
            <PolarGrid
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
            <PolarAngleAxis
              dataKey="criterion"
              tick={WrappedTick as never}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
