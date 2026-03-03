"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/demian/dashboard-sidebar"
import { MetricCard } from "@/components/demian/metric-card"
import { ScoreBadge } from "@/components/demian/score-badge"
import {
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  Menu,
  Bell,
  Search,
  LayoutDashboard,
  FileUp,
  Sparkles,
  History,
  Settings,
  CheckCircle2,
  Circle,
  Lightbulb,
  Clock,
  FileText,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Startup, PitchVersion } from "@/lib/supabase/types"
import { reuploadDeck, updateDeckPath } from "@/app/founder/actions"

const sidebarLinks = [
  { href: "/founder/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/founder/submit", label: "Submit Pitch", icon: FileUp },
  { href: "#", label: "AI Feedback", icon: Sparkles },
  { href: "#", label: "Pitch History", icon: History },
  { href: "#", label: "Settings", icon: Settings },
]

interface FounderDashboardClientProps {
  startup: Startup
  pitchVersions: PitchVersion[]
  viewCount: number
}

export function FounderDashboardClient({
  startup,
  pitchVersions,
  viewCount,
}: FounderDashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const latestVersion = pitchVersions[0]
  const versionCount = pitchVersions.length

  // Parse improvements if it's a JSON array
  const improvements = Array.isArray(startup.improvements)
    ? (startup.improvements as { label: string; done: boolean }[])
    : []

  async function handleReupload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await reuploadDeck(file.name, file.type)
      if ("error" in result && result.error) {
        setUploading(false)
        return
      }

      // Upload directly to Supabase Storage
      const response = await fetch(result.signedUrl!, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!response.ok) {
        setUploading(false)
        return
      }

      // Update the deck path in the database
      await updateDeckPath(result.deckPath!)

      // Reload the page to show updated data
      window.location.reload()
    } catch {
      setUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        links={sidebarLinks}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Founder Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl">
            {/* Metric cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Pitch Score"
                value={startup.pitch_score ?? "—"}
                subtitle="out of 100"
                icon={BarChart3}
              />
              <MetricCard
                title="Investor-Fit Score"
                value={startup.fit_score ?? "—"}
                subtitle="average across matches"
                icon={TrendingUp}
              />
              <MetricCard
                title="Percentile Rank"
                value={startup.percentile ? `Top ${100 - startup.percentile}%` : "—"}
                subtitle={startup.percentile ? `${startup.percentile}th percentile` : "Pending analysis"}
                icon={Users}
              />
              <MetricCard
                title="Investor Views"
                value={viewCount}
                subtitle="total views"
                icon={Eye}
              />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {/* Main panel: 2 cols */}
              <div className="flex flex-col gap-8 lg:col-span-2">
                {/* Uploaded deck */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-card-foreground">Your Pitch Deck</h2>
                    <Badge variant="outline" className="text-xs">
                      Version {versionCount || 1}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-background p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">
                        {startup.deck_path ? startup.deck_path.split("/").pop() : "No deck uploaded"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {latestVersion
                          ? `Uploaded ${new Date(latestVersion.uploaded_at).toLocaleDateString()}`
                          : "Upload your first deck"}
                      </p>
                    </div>
                    <label className={`cursor-pointer rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                      <input
                        type="file"
                        accept=".pdf,.pptx,.ppt"
                        className="hidden"
                        onChange={handleReupload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading...
                        </span>
                      ) : (
                        "Re-upload"
                      )}
                    </label>
                  </div>
                </div>

                {/* AI feedback summary — only show if we have data */}
                {startup.summary && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-semibold text-card-foreground">AI Feedback Summary</h2>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {startup.summary}
                    </p>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      {startup.strengths && startup.strengths.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            Strengths
                          </h3>
                          <ul className="mt-3 flex flex-col gap-2">
                            {startup.strengths.map((s) => (
                              <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {startup.weaknesses && startup.weaknesses.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-warning">
                            <Lightbulb className="h-4 w-4" />
                            Areas to Improve
                          </h3>
                          <ul className="mt-3 flex flex-col gap-2">
                            {startup.weaknesses.map((w) => (
                              <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Improvements checklist — only show if we have data */}
                {improvements.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-base font-semibold text-card-foreground">Improve Your Pitch</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Complete these items to boost your score</p>
                    <div className="mt-4 flex flex-col gap-3">
                      {improvements.map((item) => (
                        <label
                          key={item.label}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/30"
                        >
                          {item.done ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${item.done ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* No AI feedback yet — show pending state */}
                {!startup.summary && (
                  <div className="rounded-2xl border border-primary/20 bg-card p-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-semibold text-card-foreground">AI Feedback</h2>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Your pitch is being analyzed. AI feedback, scores, and improvement suggestions will appear here once processing is complete.
                    </p>
                  </div>
                )}

                {/* Pitch history */}
                {pitchVersions.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-base font-semibold text-card-foreground">Pitch History</h2>
                    <div className="mt-4 flex flex-col gap-3">
                      {pitchVersions.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-card-foreground">
                                Pitch Deck v{v.version}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(v.uploaded_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          {v.score !== null && <ScoreBadge score={v.score} size="sm" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-8">
                {/* Startup info */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-card-foreground">Your Startup</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    <InfoRow label="Name" value={startup.startup_name} />
                    <InfoRow label="Sector" value={startup.sector ?? "—"} />
                    <InfoRow label="Stage" value={startup.stage ?? "—"} />
                    <InfoRow label="Fundraising" value={startup.fundraising ?? "—"} />
                  </div>
                </div>

                {/* Recent activity placeholder */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-card-foreground">Recent Activity</h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {viewCount > 0 ? (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm text-card-foreground">
                            {viewCount} investor{viewCount === 1 ? "" : "s"} viewed your pitch
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            All time
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No activity yet. Investors will discover your pitch soon.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-card-foreground">{value}</span>
    </div>
  )
}
