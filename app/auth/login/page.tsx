"use client"

import { useState } from "react"
import { login } from "@/app/auth/actions"
import { Navbar } from "@/components/demian/navbar"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to your Demian account</p>

        <form onSubmit={handleSubmit} className="mt-8 w-full">
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
                placeholder="Your password"
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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  )
}
