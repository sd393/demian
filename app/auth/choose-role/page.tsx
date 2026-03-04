"use client"

import { useState } from "react"
import { chooseRole } from "@/app/auth/actions"
import { Navbar } from "@/components/demian/navbar"
import { Zap } from "lucide-react"

export default function ChooseRolePage() {
  const [role, setRole] = useState<"founder" | "investor">("founder")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    setError("")
    setLoading(true)

    const result = await chooseRole(role)
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
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Choose your role
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you joining Demian as a founder or an investor?
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

        {error && (
          <div className="mt-4 w-full rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Continue"}
        </button>
      </main>
    </div>
  )
}
