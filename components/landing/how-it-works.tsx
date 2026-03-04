import { Upload, Brain, Rocket } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Founders upload their pitch",
    description:
      "Submit your pitch deck, startup details, and traction metrics.",
  },
  {
    icon: Brain,
    step: "02",
    title: "Demian analyzes and scores it",
    description:
      "AI evaluates pitch quality, market fit, team strength, and traction.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Investors discover the best fits",
    description:
      "VCs browse ranked, thesis-matched deal flow. The strongest founders surface automatically.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium text-primary">How it Works</span>
          <h2 className="mt-3 font-serif text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three steps to better deal flow
          </h2>
        </div>

        <div className="relative mt-16 grid gap-12 md:grid-cols-3">
          {/* Connecting line */}
          <div className="pointer-events-none absolute top-6 right-0 left-0 hidden h-px bg-border md:block" />

          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card font-mono text-sm font-bold text-primary">
                {s.step}
              </div>
              <h3 className="mt-5 text-base font-semibold text-card-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
