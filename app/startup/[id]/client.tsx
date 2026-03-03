"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/demian/navbar"
import { ScoreBadge } from "@/components/demian/score-badge"
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Mail,
  GraduationCap,
  MapPin,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Startup, PitchVersion } from "@/lib/supabase/types"
import { toggleSaveStartup, recordStartupView } from "@/app/investor/actions"

interface SimilarStartup {
  id: string
  startup_name: string
  sector: string | null
  stage: string | null
  pitch_score: number | null
  founder_name: string
}

interface StartupDetailClientProps {
  startup: Startup
  pitchVersions: PitchVersion[]
  isSaved: boolean
  similarStartups: SimilarStartup[]
  viewCount: number
  deckUrl: string | null
  userRole: string | undefined
}

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `oklch(0.35 0.1 ${hue})`
}

export function StartupDetailClient({
  startup,
  pitchVersions,
  isSaved: initialSaved,
  similarStartups,
  viewCount,
  deckUrl,
  userRole,
}: StartupDetailClientProps) {
  const [saved, setSaved] = useState(initialSaved)
  const isInvestor = userRole === "investor"

  // Record view on mount (investor only)
  useEffect(() => {
    if (isInvestor) {
      recordStartupView(startup.id)
    }
  }, [isInvestor, startup.id])

  async function handleToggleSave() {
    if (!isInvestor) return
    setSaved(!saved)
    await toggleSaveStartup(startup.id)
  }

  const color = stringToColor(startup.startup_name)
  const latestVersion = pitchVersions[0]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Back nav */}
        <Link
          href={isInvestor ? "/investor/dashboard" : "/founder/dashboard"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {isInvestor ? "Back to Deal Flow" : "Back to Dashboard"}
        </Link>

        {/* Header */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-card-foreground"
                style={{ backgroundColor: color }}
              >
                {startup.startup_name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-card-foreground">{startup.startup_name}</h1>
                  {startup.stage && <Badge variant="outline">{startup.stage}</Badge>}
                  {startup.sector && <Badge variant="outline" className="border-primary/30 text-primary">{startup.sector}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{startup.founder_name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {startup.school}
                  </span>
                  {startup.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {startup.location}
                    </span>
                  )}
                  {startup.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {startup.website}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {startup.pitch_score !== null && (
                <ScoreBadge score={startup.pitch_score} label="Pitch Score" size="lg" />
              )}
              {startup.fit_score !== null && (
                <ScoreBadge score={startup.fit_score} label="Fit Score" size="lg" />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            {isInvestor && (
              <>
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    saved
                      ? "bg-primary/10 text-primary"
                      : "border border-border bg-card text-card-foreground hover:bg-secondary"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save to Shortlist"}
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <Mail className="h-4 w-4" />
                  Request Intro
                </button>
              </>
            )}
            <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-secondary">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main content: 2 cols */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Summary */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-card-foreground">Startup Summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {startup.summary || startup.one_liner}
              </p>
              {startup.tags && startup.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {startup.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Problem / Solution */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <h2 className="text-base font-semibold text-card-foreground">Problem</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {startup.problem}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <h2 className="text-base font-semibold text-card-foreground">Solution</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {startup.solution}
                </p>
              </div>
            </div>

            {/* Traction */}
            {startup.traction && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold text-card-foreground">Traction</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {startup.traction}
                </p>
              </div>
            )}

            {/* AI-generated feedback (if available) */}
            {startup.summary && startup.strengths && startup.strengths.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-card p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold text-card-foreground">AI Analysis</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {startup.summary}
                </p>
                {startup.strengths.length > 0 && (
                  <div className="mt-4 rounded-xl bg-success/5 p-4">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Strengths
                    </h3>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {startup.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Target className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Deck preview */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-card-foreground">Pitch Deck</h2>
              <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background py-16">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-card-foreground">
                  {startup.deck_path ? startup.deck_path.split("/").pop() : "No deck uploaded"}
                </p>
                {latestVersion && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Version {latestVersion.version} - Uploaded{" "}
                    {new Date(latestVersion.uploaded_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {deckUrl && (
                  <a
                    href={deckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    View Full Deck
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">
            {/* Quick stats */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-card-foreground">Quick Stats</h3>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { label: "Sector", value: startup.sector ?? "—" },
                  { label: "Stage", value: startup.stage ?? "—" },
                  { label: "Fundraising", value: startup.fundraising ?? "—" },
                  { label: "Investor Views", value: `${viewCount} total` },
                  { label: "Deck Versions", value: `${pitchVersions.length}` },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span className="text-sm font-medium text-card-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder info */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-card-foreground">Founder Profile</h3>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-card-foreground"
                  style={{ backgroundColor: color }}
                >
                  {startup.founder_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{startup.founder_name}</p>
                  <p className="text-xs text-muted-foreground">{startup.email}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{startup.school}</span>
                </div>
                {startup.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{startup.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Similar startups */}
            {similarStartups.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-card-foreground">Similar Startups</h3>
                <div className="mt-4 flex flex-col gap-3">
                  {similarStartups.map((s) => (
                    <Link
                      key={s.id}
                      href={`/startup/${s.id}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/30"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-card-foreground"
                        style={{ backgroundColor: stringToColor(s.startup_name) }}
                      >
                        {s.startup_name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">{s.startup_name}</p>
                        <p className="text-xs text-muted-foreground">{s.sector ?? "Other"} - {s.stage ?? "Unknown"}</p>
                      </div>
                      {s.pitch_score !== null && (
                        <span className="font-mono text-xs font-semibold text-primary">{s.pitch_score}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
