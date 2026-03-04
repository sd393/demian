import { Navbar } from "@/components/demian/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { DualValue } from "@/components/landing/dual-value"
import { Features } from "@/components/landing/features"
import { CtaFooter } from "@/components/landing/cta-footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <DualValue />
        <Features />
        <CtaFooter />
      </main>
    </div>
  )
}
