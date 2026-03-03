"use client"

import { useState, useCallback } from "react"
import { DashboardSidebar } from "@/components/demian/dashboard-sidebar"
import { MetricCard } from "@/components/demian/metric-card"
import { StartupCard, type StartupCardData } from "@/components/demian/startup-card"
import {
  LayoutDashboard,
  Search,
  Bookmark,
  Settings,
  Menu,
  Bell,
  Users,
  TrendingUp,
  Target,
  Star,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react"
import type { Startup } from "@/lib/supabase/types"
import { toggleSaveStartup } from "@/app/investor/actions"

const sidebarLinks = [
  { href: "/investor/dashboard", label: "Deal Flow", icon: LayoutDashboard },
  { href: "#", label: "Saved Startups", icon: Bookmark },
  { href: "#", label: "Discover", icon: Search },
  { href: "/investor/onboarding", label: "My Thesis", icon: Target },
  { href: "#", label: "Settings", icon: Settings },
]

const sectors = ["All", "HealthTech", "CleanTech", "FinTech", "EdTech", "Enterprise", "AgTech"]
const stages = ["All", "Pre-Seed", "Seed", "Series A"]

// Generate a stable color from a string
function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `oklch(0.35 0.1 ${hue})`
}

// Convert DB Startup to StartupCardData for the card component
function toCardData(s: Startup): StartupCardData {
  return {
    id: s.id,
    startupName: s.startup_name,
    founderName: s.founder_name,
    school: s.school,
    sector: s.sector ?? "Other",
    stage: s.stage ?? "Unknown",
    location: s.location ?? "",
    pitchScore: s.pitch_score ?? 0,
    fitScore: s.fit_score ?? 0,
    summary: s.one_liner || s.summary || "",
    tags: s.tags ?? [],
    imageColor: stringToColor(s.startup_name),
  }
}

interface InvestorDashboardClientProps {
  startups: Startup[]
  savedIds: string[]
}

export function InvestorDashboardClient({
  startups,
  savedIds: initialSavedIds,
}: InvestorDashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSector, setSelectedSector] = useState("All")
  const [selectedStage, setSelectedStage] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds))

  const cardData = startups.map(toCardData)

  const filteredStartups = cardData.filter((s) => {
    if (selectedSector !== "All" && s.sector !== selectedSector) return false
    if (selectedStage !== "All" && s.stage !== selectedStage) return false
    if (searchQuery && !s.startupName.toLowerCase().includes(searchQuery.toLowerCase()) && !s.founderName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleToggleSave = useCallback(async (startupId: string) => {
    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(startupId)) {
        next.delete(startupId)
      } else {
        next.add(startupId)
      }
      return next
    })

    // Persist to DB
    await toggleSaveStartup(startupId)
  }, [])

  const savedCount = savedIds.size
  const highFitCount = cardData.filter((s) => s.fitScore > 80).length

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
            <h1 className="text-lg font-semibold text-foreground">Investor Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none lg:w-64"
              />
            </div>
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
                title="Total Startups"
                value={cardData.length}
                subtitle="in deal flow"
                icon={Target}
              />
              <MetricCard
                title="High-Fit Founders"
                value={highFitCount}
                subtitle="score > 80"
                icon={Star}
              />
              <MetricCard
                title="Trending Sectors"
                value={cardData.length > 0 ? (cardData[0]?.sector ?? "—") : "—"}
                subtitle="most startups"
                icon={TrendingUp}
              />
              <MetricCard
                title="Saved Startups"
                value={savedCount}
                subtitle="in your shortlist"
                icon={Bookmark}
              />
            </div>

            {/* Top Picks */}
            {cardData.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Top Picks For You</h2>
                    <p className="text-sm text-muted-foreground">Highest scoring startups</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...cardData]
                    .sort((a, b) => b.pitchScore - a.pitchScore)
                    .slice(0, 3)
                    .map((startup) => (
                      <StartupCard
                        key={startup.id}
                        startup={startup}
                        saved={savedIds.has(startup.id)}
                        onToggleSave={handleToggleSave}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Filters + full list */}
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">All Startups</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(selectedSector !== "All" || selectedStage !== "All") && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {(selectedSector !== "All" ? 1 : 0) + (selectedStage !== "All" ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Filters panel */}
              {showFilters && (
                <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-card-foreground">Filter Startups</span>
                    </div>
                    {(selectedSector !== "All" || selectedStage !== "All") && (
                      <button
                        onClick={() => { setSelectedSector("All"); setSelectedStage("All") }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:gap-8">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Sector</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sectors.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSector(s)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              selectedSector === s
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Stage</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {stages.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedStage(s)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              selectedStage === s
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="mt-4">
                {filteredStartups.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredStartups.map((startup) => (
                      <StartupCard
                        key={startup.id}
                        startup={startup}
                        saved={savedIds.has(startup.id)}
                        onToggleSave={handleToggleSave}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16">
                    <Users className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-4 text-sm font-medium text-card-foreground">
                      {cardData.length === 0
                        ? "No startups have been submitted yet"
                        : "No startups match your filters"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cardData.length === 0
                        ? "Check back soon as founders submit their pitches"
                        : "Try adjusting your search or filter criteria"}
                    </p>
                    {cardData.length > 0 && (
                      <button
                        onClick={() => { setSelectedSector("All"); setSelectedStage("All"); setSearchQuery("") }}
                        className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
