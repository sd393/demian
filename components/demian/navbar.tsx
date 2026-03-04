import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Zap, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/app/auth/actions"

const publicLinks = [{ href: "/", label: "Home" }]

const founderLinks = [
  { href: "/founder/dashboard", label: "Dashboard" },
  { href: "/founder/submit", label: "Submit Pitch" },
]

const investorLinks = [
  { href: "/investor/dashboard", label: "Deal Flow" },
  { href: "/investor/onboarding", label: "My Thesis" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, role, loading } = useAuth()

  const navLinks = [
    ...publicLinks,
    ...(role === "founder" ? founderLinks : []),
    ...(role === "investor" ? investorLinks : []),
    // Allow access to startup detail pages for everyone
  ]

  return (
    <header className="sticky top-0 z-50 bg-transparent backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <span className="font-serif text-lg font-bold uppercase tracking-tight text-foreground">Demian</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-secondary" />
          ) : user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-secondary"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!loading && (
              user ? (
                <form action={signOut}>
                  <button
                    type="submit"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-xl border border-border bg-card px-4 py-2 text-center text-sm font-medium text-card-foreground"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  )
}
