"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/demian/dashboard-sidebar"
import { MetricCard } from "@/components/demian/metric-card"
import { ScoreBadge } from "@/components/demian/score-badge"
import { demoFeedback, demoInvestors, demoActivity } from "@/lib/demo-data"
import {
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  Menu,
  Bell,
  Search,
  LayoutDashboard,
  FileText,
  Lightbulb,
  History,
  Settings,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  FileUp,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const sidebarLinks = [
  { href: "/founder/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/founder/submit", label: "Submit Pitch", icon: FileUp },
  { href: "#", label: "AI Feedback", icon: Sparkles },
  { href: "#", label: "Pitch History", icon: History },
  { href: "#", label: "Settings", icon: Settings },
]

export default function FounderDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
                value={demoFeedback.overallScore}
                subtitle="out of 100"
                icon={BarChart3}
                trend={{ value: "2 pts", positive: true }}
              />
              <MetricCard
                title="Investor-Fit Score"
                value={demoFeedback.fitScore}
                subtitle="average across matches"
                icon={TrendingUp}
                trend={{ value: "5 pts", positive: true }}
              />
              <MetricCard
                title="Percentile Rank"
                value={`Top ${100 - demoFeedback.percentile}%`}
                subtitle={`${demoFeedback.percentile}th percentile`}
                icon={Users}
              />
              <MetricCard
                title="Investor Views"
                value={demoFeedback.investorViews}
                subtitle="this month"
                icon={Eye}
                trend={{ value: "8 views", positive: true }}
              />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {/* Main panel: 2 cols */}
              <div className="flex flex-col gap-8 lg:col-span-2">
                {/* Uploaded deck */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-card-foreground">Your Pitch Deck</h2>
                    <Badge variant="outline" className="text-xs">Version 3</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-background p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">NeuralMed_Pitch_v3.pdf</p>
                      <p className="text-xs text-muted-foreground">Uploaded 2 days ago - 14 slides</p>
                    </div>
                    <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
                      Re-upload
                    </button>
                  </div>
                </div>

                {/* AI feedback summary */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold text-card-foreground">AI Feedback Summary</h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {demoFeedback.summary}
                  </p>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    {/* Strengths */}
                    <div>
                      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        Strengths
                      </h3>
                      <ul className="mt-3 flex flex-col gap-2">
                        {demoFeedback.strengths.map((s) => (
                          <li
                            key={s}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-warning">
                        <Lightbulb className="h-4 w-4" />
                        Areas to Improve
                      </h3>
                      <ul className="mt-3 flex flex-col gap-2">
                        {demoFeedback.weaknesses.map((w) => (
                          <li
                            key={w}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Improve your pitch checklist */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-card-foreground">Improve Your Pitch</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Complete these items to boost your score</p>
                  <div className="mt-4 flex flex-col gap-3">
                    {demoFeedback.improvements.map((item) => (
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

                {/* Pitch history */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-card-foreground">Pitch History</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {[
                      { version: "v3", date: "Feb 28, 2026", score: 87 },
                      { version: "v2", date: "Feb 20, 2026", score: 82 },
                      { version: "v1", date: "Feb 10, 2026", score: 74 },
                    ].map((v) => (
                      <div
                        key={v.version}
                        className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-card-foreground">Pitch Deck {v.version}</p>
                            <p className="text-xs text-muted-foreground">{v.date}</p>
                          </div>
                        </div>
                        <ScoreBadge score={v.score} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-8">
                {/* Recommended investors */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-card-foreground">Recommended Investors</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {demoInvestors.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/30"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {inv.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-card-foreground">{inv.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{inv.focus.join(", ")}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-card-foreground">Recent Activity</h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {demoActivity.map((a, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          {a.type === "view" && <Eye className="h-3.5 w-3.5" />}
                          {a.type === "score" && <TrendingUp className="h-3.5 w-3.5" />}
                          {a.type === "match" && <Users className="h-3.5 w-3.5" />}
                          {a.type === "feedback" && <Sparkles className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm text-card-foreground">{a.message}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {a.time}
                          </p>
                        </div>
                      </div>
                    ))}
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
