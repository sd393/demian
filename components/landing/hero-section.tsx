import Link from "next/link"
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-20 lg:pt-32">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.2_0.05_160)_0%,_transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-20">
          {/* Left: Copy */}
          <div className="max-w-2xl flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Founder Discovery
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Where the best student founders get discovered.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Founders upload their pitch. Demian evaluates it with AI.
              Investors discover top opportunities faster than ever before.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/founder/submit"
                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                For Founders
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/investor/onboarding"
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
              >
                For Investors
              </Link>
            </div>
          </div>

          {/* Right: Product mockup preview */}
          <div className="w-full max-w-md flex-shrink-0 lg:max-w-lg">
            <div className="relative rounded-2xl border border-border bg-card p-1 shadow-2xl shadow-primary/5">
              <div className="rounded-xl bg-background p-5">
                {/* Mockup header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-foreground">Founder Pitch Analysis</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>

                {/* Score row */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 rounded-xl border border-border bg-card p-3">
                    <span className="text-xs text-muted-foreground">Pitch Score</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-success">92</span>
                      <span className="text-xs text-success">/100</span>
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card p-3">
                    <span className="text-xs text-muted-foreground">Rank</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">#4</span>
                      <span className="text-xs text-muted-foreground">of 2,340</span>
                    </div>
                  </div>
                </div>

                {/* Fit tags */}
                <div className="mt-4">
                  <span className="text-xs text-muted-foreground">Investor-Fit Tags</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["AI/ML", "HealthTech", "Pre-Seed", "B2B SaaS", "Strong Traction"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI feedback snippet */}
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Feedback</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {"\"Strong problem-solution fit with clear market sizing. Recommend adding competitive moat analysis and projected unit economics...\""}
                  </p>
                </div>

                {/* Recommended investors */}
                <div className="mt-4">
                  <span className="text-xs text-muted-foreground">Top Investor Matches</span>
                  <div className="mt-2 flex flex-col gap-2">
                    {[
                      { name: "Sequoia Scout", fit: 94, color: "oklch(0.35 0.12 160)" },
                      { name: "Greenlight VC", fit: 89, color: "oklch(0.35 0.12 220)" },
                      { name: "TechBridge Cap.", fit: 85, color: "oklch(0.35 0.12 80)" },
                    ].map((inv) => (
                      <div
                        key={inv.name}
                        className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-card-foreground"
                            style={{ backgroundColor: inv.color }}
                          >
                            {inv.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-card-foreground">{inv.name}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-success">{inv.fit}% fit</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Users, value: "2,340+", label: "Student Founders" },
            { icon: TrendingUp, value: "480+", label: "Active Investors" },
            { value: "$12M+", label: "Capital Deployed", icon: Sparkles },
            { value: "94%", label: "Founder Satisfaction", icon: Sparkles },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center"
            >
              <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
