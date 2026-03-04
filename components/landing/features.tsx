import { Brain, Target, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Pitch Analysis",
    description: "Deep evaluation of pitch quality, market sizing, competitive positioning, and team strength.",
  },
  {
    icon: Target,
    title: "Investor-Fit Matching",
    description: "Automatically match founders with investors based on thesis alignment, stage, and check size.",
  },
  {
    icon: BarChart3,
    title: "Founder Ranking",
    description: "Rank student founders by pitch quality and readiness. Investors see the strongest opportunities first.",
  },
]

export function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <span className="text-sm font-medium text-primary">Features</span>
          <h2 className="mt-3 font-serif text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to connect
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-5 border-l-2 border-primary/30 py-2 pl-6 transition-colors hover:border-primary"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
