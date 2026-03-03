import { Brain, Eye, TrendingUp, Filter, Target, Zap } from "lucide-react"

const founderBenefits = [
  { icon: Brain, title: "AI Pitch Feedback", desc: "Get instant, actionable AI analysis of your pitch deck strengths and weaknesses." },
  { icon: Eye, title: "Better Investor Visibility", desc: "Rank higher and surface to investors whose thesis matches your startup." },
  { icon: TrendingUp, title: "Improve Before Sending", desc: "Iterate on your deck with AI guidance before it reaches investor inboxes." },
]

const investorBenefits = [
  { icon: Target, title: "Ranked Deal Flow", desc: "See the highest-quality, best-fit startups first. No more spray-and-pray." },
  { icon: Filter, title: "Thesis-Based Matching", desc: "Filter by sector, stage, geography, and check size to find your ideal deals." },
  { icon: Zap, title: "Faster Filtering", desc: "AI-scored pitches let you quickly identify the most promising student founders." },
]

export function DualValue() {
  return (
    <section className="border-y border-border bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for both sides of the table
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Demian creates value for founders seeking capital and investors seeking the next generation of breakout companies.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Founders */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              For Founders
            </div>
            <h3 className="mt-4 text-xl font-semibold text-card-foreground">
              Sharpen your pitch. Get discovered.
            </h3>
            <div className="mt-6 flex flex-col gap-5">
              {founderBenefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-card-foreground">{b.title}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investors */}
          <div className="rounded-2xl border border-primary/20 bg-card p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              For Investors
            </div>
            <h3 className="mt-4 text-xl font-semibold text-card-foreground">
              Elite deal flow. AI-ranked.
            </h3>
            <div className="mt-6 flex flex-col gap-5">
              {investorBenefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-card-foreground">{b.title}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
