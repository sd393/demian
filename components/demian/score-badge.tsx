"use client"

import { cn } from "@/lib/utils"

interface ScoreBadgeProps {
  score: number
  label?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-success"
  if (score >= 70) return "text-chart-1"
  if (score >= 50) return "text-warning"
  return "text-destructive"
}

function getScoreBg(score: number) {
  if (score >= 85) return "bg-success/10 border-success/20"
  if (score >= 70) return "bg-chart-1/10 border-chart-1/20"
  if (score >= 50) return "bg-warning/10 border-warning/20"
  return "bg-destructive/10 border-destructive/20"
}

export function ScoreBadge({ score, label, size = "md", className }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border font-mono font-bold",
          sizeClasses[size],
          getScoreColor(score),
          getScoreBg(score)
        )}
      >
        {score}
      </div>
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  )
}
