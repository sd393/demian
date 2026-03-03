"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/demian/dashboard-sidebar"
import { MetricCard } from "@/components/demian/metric-card"
import { StartupCard } from "@/components/demian/startup-card"
import { demoStartups } from "@/lib/demo-data"
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
import { Badge } from "@/components/ui/badge"

const sidebarLinks = [
  { href: "/investor/dashboard", label: "Deal Flow", icon: LayoutDashboard },
  { href: "#", label: "Saved Startups", icon: Bookmark },
  { href: "#", label: "Discover", icon: Search },
  { href: "/investor/onboarding", label: "My Thesis", icon: Target },
  { href: "#", label: "Settings", icon: Settings },
]

const sectors = ["All", "HealthTech", "CleanTech", "FinTech", "EdTech", "Enterprise", "AgTech"]
const stages = ["All", "Pre-Seed", "Seed", "Series A"]

export default function InvestorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSector, setSelectedSector] = useState("All")
  const [selectedStage, setSelectedStage] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const filteredStartups = demoStartups.filter((s) => {
    if (selectedSector !== "All" && s.sector !== selectedSector) return false
    if (selectedStage !== "All" && s.stage !== selectedStage) return false
    if (searchQuery && !s.startupName.toLowerCase().includes(searchQuery.toLowerCase()) && !s.founderName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

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
                title="Matched This Week"
                value={12}
                subtitle="new startups"
                icon={Target}
                trend={{ value: "4 more", positive: true }}
              />
              <MetricCard
                title="High-Fit Founders"
                value={8}
                subtitle="score > 80"
                icon={Star}
              />
              <MetricCard
                title="Trending Sectors"
                value="AI/ML"
                subtitle="highest activity"
                icon={TrendingUp}
              />
              <MetricCard
                title="Saved Startups"
                value={15}
                subtitle="in your shortlist"
                icon={Bookmark}
              />
            </div>

            {/* Top Picks */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Top Picks For You</h2>
                  <p className="text-sm text-muted-foreground">AI-matched based on your investment thesis</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {demoStartups.slice(0, 3).map((startup) => (
                  <StartupCard key={startup.id} startup={startup} />
                ))}
              </div>
            </div>

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
                      <StartupCard key={startup.id} startup={startup} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16">
                    <Users className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-4 text-sm font-medium text-card-foreground">No startups match your filters</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => { setSelectedSector("All"); setSelectedStage("All"); setSearchQuery("") }}
                      className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Recently uploaded */}
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-foreground">Recently Uploaded Pitches</h2>
                <p className="text-sm text-muted-foreground">Fresh deal flow from the past 7 days</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {demoStartups.slice(3, 6).map((startup) => (
                    <StartupCard key={startup.id} startup={startup} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
