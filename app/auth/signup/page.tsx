"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { signup } from "@/app/auth/actions"
import { Navbar } from "@/components/demian/navbar"
import { Zap } from "lucide-react"
import Link from "next/link"

function SignupForm() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "investor" ? "investor" : "founder"

  const [role, setRole] = useState(defaultRole)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
