import { Upload, Brain, Rocket } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Founders upload their pitch",
    description:
      "Submit your pitch deck, startup details, and traction metrics. Our platform makes it easy to showcase your vision.",
  },
  {
    icon: Brain,
    step: "02",
    title: "Demian analyzes and scores it",
    description:
      "Our AI evaluates pitch quality, market fit, team strength, and traction against thousands of data points.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Investors discover the best-fit opportunities",
    description:
      "VCs browse ranked, thesis-matched deal flow. The strongest founders surface to the top automatically.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium text-primary">How it Works</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three steps to better deal flow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Whether you are a founder looking for funding or an investor seeking the next big thing, Demian streamlines the connection.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">{s.step}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-card-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
