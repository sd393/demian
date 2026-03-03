import { Brain, Users, BarChart3, FileText, Target, LayoutDashboard } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Pitch Analysis",
    description: "Deep evaluation of pitch quality, market sizing, competitive positioning, and team strength using advanced language models.",
  },
  {
    icon: Target,
    title: "Investor-Fit Matching",
    description: "Automatically match founders with investors based on thesis alignment, sector focus, stage preference, and check size.",
  },
  {
    icon: BarChart3,
    title: "Founder Ranking",
    description: "Rank student founders by pitch quality and readiness. Investors see the strongest opportunities first.",
  },
  {
    icon: FileText,
    title: "Deck Feedback",
    description: "Detailed AI-generated feedback on every section of your pitch deck with actionable improvement suggestions.",
  },
  {
    icon: Users,
    title: "Thesis-Based Recommendations",
    description: "Investors receive personalized startup recommendations based on their investment criteria and portfolio strategy.",
  },
  {
    icon: LayoutDashboard,
    title: "Discovery Dashboard",
    description: "A powerful dashboard for investors to browse, filter, and shortlist the most promising student startups.",
  },
]

export function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium text-primary">Features</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to connect
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Purpose-built tools for the founder-investor pipeline, powered by AI from day one.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
