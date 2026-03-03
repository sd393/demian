"use client"

import { use } from "react"
import { Navbar } from "@/components/demian/navbar"
import { ScoreBadge } from "@/components/demian/score-badge"
import { demoStartups } from "@/lib/demo-data"
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Mail,
  GraduationCap,
  MapPin,
  Globe,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const startup = demoStartups.find((s) => s.id === id) || demoStartups[0]
  const [saved, setSaved] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Back nav */}
        <Link
          href="/investor/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deal Flow
        </Link>

        {/* Header */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-card-foreground"
                style={{ backgroundColor: startup.imageColor }}
              >
                {startup.startupName.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-card-foreground">{startup.startupName}</h1>
                  <Badge variant="outline">{startup.stage}</Badge>
                  <Badge variant="outline" className="border-primary/30 text-primary">{startup.sector}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{startup.founderName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {startup.school}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {startup.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    neuralmed.ai
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ScoreBadge score={startup.pitchScore} label="Pitch Score" size="lg" />
              <ScoreBadge score={startup.fitScore} label="Fit Score" size="lg" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              onClick={() => setSaved(!saved)}
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
                {startup.summary} The platform leverages proprietary machine learning models trained on millions of medical images to provide real-time diagnostic assistance to healthcare professionals. Current pilot programs with major hospital systems have demonstrated significant reductions in diagnosis time while maintaining accuracy rates above 98%.
              </p>
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
            </div>

            {/* Problem / Solution */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <h2 className="text-base font-semibold text-card-foreground">Problem</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Medical imaging analysis is a bottleneck in healthcare delivery. Radiologists face increasing workloads with average reading times of 8-12 minutes per scan. Misdiagnosis rates remain at 3-5%, costing the healthcare system billions annually.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <h2 className="text-base font-semibold text-card-foreground">Solution</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  NeuralMed provides an AI co-pilot for radiologists that pre-analyzes scans, highlights areas of concern, and suggests diagnoses. This reduces reading time by 80% and improves diagnostic accuracy to 99.2%.
                </p>
              </div>
            </div>

            {/* Traction */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-card-foreground">Traction</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Users, label: "Monthly Active Users", value: "10,000+" },
                  { icon: DollarSign, label: "Monthly Revenue", value: "$85K MRR" },
                  { icon: BarChart3, label: "Growth Rate", value: "25% MoM" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="flex flex-col items-center rounded-xl border border-border bg-background p-4 text-center"
                  >
                    <metric.icon className="h-5 w-5 text-primary" />
                    <span className="mt-2 text-lg font-bold text-card-foreground">{metric.value}</span>
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Investment Memo */}
            <div className="rounded-2xl border border-primary/20 bg-card p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-card-foreground">AI-Generated Investment Memo</h2>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <div className="rounded-xl bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-card-foreground">Executive Summary</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    NeuralMed represents a compelling investment opportunity in the intersection of AI and healthcare. The company has demonstrated strong product-market fit with rapid adoption across hospital systems. The founding team combines deep ML expertise from Stanford with healthcare domain knowledge. With $85K MRR growing 25% month-over-month, the company is on a trajectory to reach $1M ARR within the next quarter.
                  </p>
                </div>
                <div className="rounded-xl bg-success/5 p-4">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Why This Matches Your Thesis
                  </h3>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {[
                      "Strong alignment with your AI/ML sector focus",
                      "Pre-Seed stage matches your preferred entry point",
                      "B2B SaaS model with enterprise sales motion",
                      "Healthcare vertical with large TAM ($12B+ by 2028)",
                      "Founded by Stanford students with technical depth",
                    ].map((reason) => (
                      <li key={reason} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Target className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Deck preview */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-card-foreground">Pitch Deck Preview</h2>
              <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background py-16">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-card-foreground">NeuralMed_Pitch_v3.pdf</p>
                <p className="mt-1 text-xs text-muted-foreground">14 slides - Uploaded Feb 28, 2026</p>
                <button className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20">
                  View Full Deck
                </button>
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
                  { label: "Founded", value: "2025" },
                  { label: "Team Size", value: "6 people" },
                  { label: "Raising", value: "$1.5M Pre-Seed" },
                  { label: "Previous Funding", value: "$200K (grants)" },
                  { label: "Investor Views", value: "47 this month" },
                  { label: "Rank", value: "#4 of 2,340" },
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
                  style={{ backgroundColor: startup.imageColor }}
                >
                  {startup.founderName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{startup.founderName}</p>
                  <p className="text-xs text-muted-foreground">CEO & Co-founder</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>MS Computer Science, {startup.school}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Previously at Google Health</span>
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-card-foreground">Score Breakdown</h3>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { label: "Market Opportunity", score: 94 },
                  { label: "Team Strength", score: 91 },
                  { label: "Product Readiness", score: 88 },
                  { label: "Traction Quality", score: 90 },
                  { label: "Pitch Clarity", score: 85 },
                  { label: "Financial Projections", score: 78 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="font-mono text-xs font-semibold text-card-foreground">{item.score}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar startups */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-card-foreground">Similar Startups</h3>
              <div className="mt-4 flex flex-col gap-3">
                {demoStartups.filter((s) => s.id !== startup.id).slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    href={`/startup/${s.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/30"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-card-foreground"
                      style={{ backgroundColor: s.imageColor }}
                    >
                      {s.startupName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-card-foreground">{s.startupName}</p>
                      <p className="text-xs text-muted-foreground">{s.sector} - {s.stage}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-primary">{s.pitchScore}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
