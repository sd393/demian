"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LandingNavbar } from "@/components/landing-navbar"
import { About } from "@/components/about"
import { HowItWorks } from "@/components/how-it-works"
import { Stats } from "@/components/stats"
import { Footer } from "@/components/footer"

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.replace("/chat")
    } else {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <LandingNavbar />
      <main>
        <About />
        <HowItWorks />
        <Stats />
      </main>
      <Footer />
    </>
  )
}
