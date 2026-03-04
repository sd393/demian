import Link from "next/link"
import { ArrowRight } from "lucide-react"

const logos = [
  // Ivy League
  "Harvard", "Yale", "Princeton", "Columbia", "UPenn", "Brown", "Dartmouth", "Cornell",
  // Other schools
  "Stanford", "MIT", "Caltech", "UIUC", "Georgia Tech", "Berkeley",
  // VCs
  "Kleiner Perkins", "Accel", "Founders Fund", "Greylock", "Norwest",
]

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="pointer-events-none absolute -top-16 inset-x-0 bottom-0 bg-[radial-gradient(ellipse_120%_60%_at_50%_20%,_oklch(0.13_0.02_160)_0%,_transparent_70%)]" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Where the best student founders get discovered.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Founders upload their pitch. Demian evaluates it with AI.
            Investors discover top opportunities faster than ever before.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup?role=founder"
              className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              For Founders
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/auth/signup?role=investor"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
            >
              For Investors
            </Link>
          </div>
        </div>

        <div className="mt-16 w-full max-w-4xl">
          <p className="mb-6 text-sm text-muted-foreground">
            Trusted by founders and investors from top institutions
          </p>
          <div
            className="overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "2.5rem",
                whiteSpace: "nowrap",
                width: "max-content",
                animation: "marquee-scroll 60s linear infinite",
              }}
            >
              {[...logos, ...logos].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="shrink-0 text-sm font-semibold tracking-wide text-muted-foreground/60"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
