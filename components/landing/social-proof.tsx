export function SocialProof() {
  const logos = [
    "Stanford", "MIT", "Harvard", "Wharton", "Y Combinator",
    "Sequoia", "a16z", "Berkeley", "Carnegie Mellon",
  ]

  return (
    <section className="border-y border-border bg-card/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Trusted by founders and investors from top institutions
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-sm font-semibold tracking-wide text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
