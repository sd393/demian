"use client"

import { useState } from "react"
import { Navbar } from "@/components/demian/navbar"
import { ProgressStepper } from "@/components/demian/progress-stepper"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Linkedin,
  Target,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { submitInvestorProfile } from "@/app/investor/actions"

const steps = [
  { label: "Profile" },
  { label: "LinkedIn" },
  { label: "Thesis" },
  { label: "Review" },
  { label: "Done" },
]

const sectorOptions = ["AI/ML", "HealthTech", "FinTech", "CleanTech", "EdTech", "Enterprise", "Consumer", "AgTech", "Crypto/Web3", "SaaS", "Marketplace", "Deep Tech"]
const stageOptions = ["Pre-Seed", "Seed", "Series A", "Series B+"]
const geoOptions = ["US - West Coast", "US - East Coast", "US - Midwest", "Europe", "Asia", "Latin America", "Africa", "Global"]

export default function InvestorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    investorName: "",
    firmName: "",
    role: "",
    linkedinUrl: "",
    sectors: [] as string[],
    stages: [] as string[],
    checkSizeMin: "",
    checkSizeMax: "",
    geography: [] as string[],
    thesis: "",
    notInterested: "",
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field: "sectors" | "stages" | "geography", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const canNext = () => {
    if (currentStep === 0) return form.investorName && form.firmName
    if (currentStep === 2) return form.sectors.length > 0
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError("")

    try {
      const formData = new FormData()
      formData.set("investorName", form.investorName)
      formData.set("firmName", form.firmName)
      formData.set("role", form.role)
      formData.set("linkedinUrl", form.linkedinUrl)
      formData.set("sectors", JSON.stringify(form.sectors))
      formData.set("stages", JSON.stringify(form.stages))
      formData.set("checkSizeMin", form.checkSizeMin)
      formData.set("checkSizeMax", form.checkSizeMax)
      formData.set("geography", JSON.stringify(form.geography))
      formData.set("thesis", form.thesis)
      formData.set("notInterested", form.notInterested)

      const result = await submitInvestorProfile(formData)
      if (result?.error) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      setCurrentStep(4)
    } catch {
      // redirect() throws NEXT_REDIRECT — expected
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (currentStep === 3) {
      handleSubmit()
    } else {
      setCurrentStep(Math.min(4, currentStep + 1))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground">Investor Onboarding</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up your profile to discover the best student founders
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <ProgressStepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="mt-10">
          {/* Step 0: Personal / Firm Details */}
          {currentStep === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Personal & Firm Details</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tell us about you and your firm</p>
              <div className="mt-6 flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="Your Name" required>
                    <input
                      type="text"
                      value={form.investorName}
                      onChange={(e) => updateField("investorName", e.target.value)}
                      placeholder="e.g. Michael Zhang"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                  <FieldGroup label="Firm Name" required>
                    <input
                      type="text"
                      value={form.firmName}
                      onChange={(e) => updateField("firmName", e.target.value)}
                      placeholder="e.g. Sequoia Capital"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label="Role / Title">
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="e.g. Partner, Scout, Associate"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Step 1: LinkedIn */}
          {currentStep === 1 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">LinkedIn Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">Help founders verify your identity and learn about your background</p>
              <div className="mt-6">
                <FieldGroup label="LinkedIn URL">
                  <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5">
                    <Linkedin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      type="url"
                      value={form.linkedinUrl}
                      onChange={(e) => updateField("linkedinUrl", e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </FieldGroup>
                <div className="mt-4 rounded-xl bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">
                    Your LinkedIn profile helps build trust with founders and is shown on your investor profile. This step is optional but strongly recommended.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Investment Thesis / Preferences */}
          {currentStep === 2 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Investment Thesis</h2>
              <p className="mt-1 text-sm text-muted-foreground">Define your preferences so we can match you with the best founders</p>
              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <span className="text-sm font-medium text-card-foreground">
                    Sectors of Interest <span className="text-destructive">*</span>
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sectorOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleArrayField("sectors", s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          form.sectors.includes(s)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {s}
                        {form.sectors.includes(s) && <X className="ml-1 inline h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-card-foreground">Stage Preference</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stageOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleArrayField("stages", s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          form.stages.includes(s)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="Check Size (Min)">
                    <input
                      type="text"
                      value={form.checkSizeMin}
                      onChange={(e) => updateField("checkSizeMin", e.target.value)}
                      placeholder="e.g. $50,000"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                  <FieldGroup label="Check Size (Max)">
                    <input
                      type="text"
                      value={form.checkSizeMax}
                      onChange={(e) => updateField("checkSizeMax", e.target.value)}
                      placeholder="e.g. $500,000"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                </div>

                <div>
                  <span className="text-sm font-medium text-card-foreground">Geography</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {geoOptions.map((g) => (
                      <button
                        key={g}
                        onClick={() => toggleArrayField("geography", g)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          form.geography.includes(g)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <FieldGroup label="Investment Thesis / Themes">
                  <textarea
                    value={form.thesis}
                    onChange={(e) => updateField("thesis", e.target.value)}
                    rows={3}
                    placeholder="Describe what you're excited about investing in..."
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>

                <FieldGroup label="What you are NOT interested in">
                  <textarea
                    value={form.notInterested}
                    onChange={(e) => updateField("notInterested", e.target.value)}
                    rows={2}
                    placeholder="Any dealbreakers or areas to avoid..."
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Review Your Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">Confirm your details before creating your investor profile</p>
              <div className="mt-6 flex flex-col gap-4">
                <ReviewRow label="Name" value={form.investorName} />
                <ReviewRow label="Firm" value={form.firmName} />
                <ReviewRow label="Role" value={form.role || "Not specified"} />
                <ReviewRow label="LinkedIn" value={form.linkedinUrl || "Not provided"} />
                <ReviewRow label="Sectors" value={form.sectors.join(", ") || "None selected"} />
                <ReviewRow label="Stages" value={form.stages.join(", ") || "None selected"} />
                <ReviewRow label="Check Size" value={form.checkSizeMin && form.checkSizeMax ? `${form.checkSizeMin} - ${form.checkSizeMax}` : "Not specified"} />
                <ReviewRow label="Geography" value={form.geography.join(", ") || "Not specified"} />
                <ReviewRow label="Thesis" value={form.thesis || "Not provided"} />
                <ReviewRow label="Exclusions" value={form.notInterested || "None"} />
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-bold text-card-foreground">Welcome to Demian!</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {"Your investor profile is live. We're already matching you with the best student founders based on your thesis."}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Target className="h-4 w-4" />
                Matching startups to your thesis...
              </div>
              <Link
                href="/investor/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Your Deal Flow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canNext() || submitting}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : currentStep === 3 ? (
                  "Create Profile"
                ) : (
                  "Continue"
                )}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-card-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-card-foreground">{value}</span>
    </div>
  )
}
