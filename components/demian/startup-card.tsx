"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ScoreBadge } from "./score-badge"
import { Bookmark, ExternalLink, GraduationCap, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export interface StartupCardData {
  id: string
  startupName: string
  founderName: string
  school: string
  sector: string
  stage: string
  location: string
  pitchScore: number
  fitScore: number
  summary: string
  tags: string[]
  imageColor: string
}

interface StartupCardProps {
  startup: StartupCardData
  className?: string
}

export function StartupCard({ startup, className }: StartupCardProps) {
  const [saved, setSaved] = useState(false)

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-card-foreground"
            style={{ backgroundColor: startup.imageColor }}
          >
            {startup.startupName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-card-foreground">{startup.startupName}</h3>
              <Badge variant="outline" className="shrink-0 text-xs">
                {startup.stage}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{startup.founderName}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {startup.school}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {startup.location}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ScoreBadge score={startup.pitchScore} label="Pitch" size="sm" />
            <ScoreBadge score={startup.fitScore} label="Fit" size="sm" />
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {startup.summary}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {startup.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/startup/${startup.id}`}
            className="flex-1 rounded-xl bg-primary/10 px-4 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            View Details
          </Link>
          <button
            onClick={() => setSaved(!saved)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
              saved
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
            )}
            aria-label={saved ? "Unsave startup" : "Save startup"}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
          <Link
            href={`/startup/${startup.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            aria-label="Open startup details"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
