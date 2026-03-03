import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

export function CtaFooter() {
  return (
    <section className="border-t border-border bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to get discovered?
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Join thousands of student founders and investors already using Demian to build the future of venture.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/founder/submit"
              className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Founder Sign Up
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/investor/onboarding"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
            >
              Investor Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto mt-20 max-w-7xl border-t border-border px-6 pt-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">Demian</span>
          </div>
          <p className="text-xs text-muted-foreground">
            2026 Demian, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  )
}
