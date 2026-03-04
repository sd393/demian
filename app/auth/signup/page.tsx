"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { signup, signUpWithGoogle } from "@/app/auth/actions"
import { Navbar } from "@/components/demian/navbar"
import { Zap } from "lucide-react"
import Link from "next/link"

function SignupForm() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "investor" ? "investor" : "founder"

  const [role, setRole] = useState(defaultRole)
  const [error, setError] = useState(searchParams.get("error") ?? "")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("role", role)

    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground">
        Join Demian as a {role === "founder" ? "founder" : "investor"}
      </p>

      {/* Role toggle */}
      <div className="mt-6 flex w-full rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setRole("founder")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            role === "founder"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Founder
        </button>
        <button
          type="button"
          onClick={() => setRole("investor")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            role === "investor"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Investor
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-card-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-card-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {/* Divider */}
      <div className="mt-6 flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        disabled={googleLoading || loading}
        onClick={async () => {
          setError("")
          setGoogleLoading(true)
          const result = await signUpWithGoogle(role)
          if (result?.error) {
            setError(result.error)
            setGoogleLoading(false)
          }
        }}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Create your account</h1>
        <Suspense fallback={<div className="mt-4 h-8 w-48 animate-pulse rounded bg-secondary" />}>
          <SignupForm />
        </Suspense>
      </main>
    </div>
  )
}
