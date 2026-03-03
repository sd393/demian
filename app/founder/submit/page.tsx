"use client"

import { useState } from "react"
import { Navbar } from "@/components/demian/navbar"
import { ProgressStepper } from "@/components/demian/progress-stepper"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle2,
  Sparkles,
  FileText,
  Rocket,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { createSignedUploadUrl, submitPitch } from "@/app/founder/actions"

const steps = [
  { label: "Basics" },
  { label: "Upload Deck" },
  { label: "Details" },
  { label: "Review" },
  { label: "Done" },
]

export default function FounderSubmitPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    startupName: "",
    founderName: "",
    school: "",
    email: "",
    sector: "",
    stage: "",
    website: "",
    oneLiner: "",
    problem: "",
    solution: "",
    traction: "",
    fundraising: "",
    deckFile: null as File | null,
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const canNext = () => {
    if (currentStep === 0) return form.startupName && form.founderName && form.school && form.email
    if (currentStep === 1) return form.deckFile
    if (currentStep === 2) return form.oneLiner && form.problem && form.solution
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError("")

    try {
      let deckPath: string | null = null

      // Step 1: If there's a file, get a signed upload URL and upload directly
      if (form.deckFile) {
        const uploadResult = await createSignedUploadUrl(
          form.deckFile.name,
          form.deckFile.type
        )

        if ("error" in uploadResult && uploadResult.error) {
          setError(uploadResult.error)
          setSubmitting(false)
          return
        }

        // Upload the file directly to Supabase Storage (bypasses Vercel 4.5MB limit)
        const uploadResponse = await fetch(uploadResult.signedUrl!, {
          method: "PUT",
          body: form.deckFile,
          headers: { "Content-Type": form.deckFile.type },
        })

        if (!uploadResponse.ok) {
          setError("Failed to upload file. Please try again.")
          setSubmitting(false)
          return
        }

        deckPath = uploadResult.deckPath!
      }

      // Step 2: Submit the text metadata via server action
      const formData = new FormData()
      formData.set("startupName", form.startupName)
      formData.set("founderName", form.founderName)
      formData.set("school", form.school)
      formData.set("email", form.email)
      formData.set("sector", form.sector)
      formData.set("stage", form.stage)
      formData.set("website", form.website)
      formData.set("oneLiner", form.oneLiner)
      formData.set("problem", form.problem)
      formData.set("solution", form.solution)
      formData.set("traction", form.traction)
      formData.set("fundraising", form.fundraising)
      if (deckPath) formData.set("deckPath", deckPath)

      const result = await submitPitch(formData)
      if (result?.error) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      // On success, submitPitch() calls redirect() — we move to step 4 as fallback
      setCurrentStep(4)
    } catch {
      // redirect() throws a NEXT_REDIRECT error — that's expected
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
          <h1 className="text-2xl font-bold text-foreground">Submit Your Pitch</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get AI-powered feedback and connect with investors
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <ProgressStepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="mt-10">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Basic Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tell us about you and your startup</p>
              <div className="mt-6 flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="Startup Name" required>
                    <input
                      type="text"
                      value={form.startupName}
                      onChange={(e) => updateField("startupName", e.target.value)}
                      placeholder="e.g. NeuralMed"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                  <FieldGroup label="Founder Name" required>
                    <input
                      type="text"
                      value={form.founderName}
                      onChange={(e) => updateField("founderName", e.target.value)}
                      placeholder="e.g. Sarah Chen"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="School / University" required>
                    <input
                      type="text"
                      value={form.school}
                      onChange={(e) => updateField("school", e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                  <FieldGroup label="Email" required>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="founder@startup.com"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FieldGroup>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="Sector">
                    <select
                      value={form.sector}
                      onChange={(e) => updateField("sector", e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select sector</option>
                      {["HealthTech", "FinTech", "CleanTech", "EdTech", "Enterprise", "AgTech", "Consumer", "Other"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Stage">
                    <select
                      value={form.stage}
                      onChange={(e) => updateField("stage", e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select stage</option>
                      {["Idea", "Pre-Seed", "Seed", "Series A"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>
                <FieldGroup label="Website">
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://www.yourstartup.com"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Step 1: Upload Deck */}
          {currentStep === 1 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Upload Your Pitch Deck</h2>
              <p className="mt-1 text-sm text-muted-foreground">Upload your deck and our AI will analyze it</p>
              <div className="mt-6">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background p-12 transition-colors hover:border-primary/50 hover:bg-primary/5">
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setForm((prev) => ({ ...prev, deckFile: file }))
                    }}
                  />
                  {form.deckFile ? (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-card-foreground">{form.deckFile.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(form.deckFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="mt-3 text-xs text-primary">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-card-foreground">
                        Drop your pitch deck here, or click to browse
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF or PPTX, up to 25MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Startup Details */}
          {currentStep === 2 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Startup Details</h2>
              <p className="mt-1 text-sm text-muted-foreground">Help investors understand your opportunity</p>
              <div className="mt-6 flex flex-col gap-5">
                <FieldGroup label="One-Line Description" required>
                  <input
                    type="text"
                    value={form.oneLiner}
                    onChange={(e) => updateField("oneLiner", e.target.value)}
                    placeholder="AI-powered diagnostics platform for hospitals"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>
                <FieldGroup label="Problem" required>
                  <textarea
                    value={form.problem}
                    onChange={(e) => updateField("problem", e.target.value)}
                    rows={3}
                    placeholder="What problem are you solving?"
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>
                <FieldGroup label="Solution" required>
                  <textarea
                    value={form.solution}
                    onChange={(e) => updateField("solution", e.target.value)}
                    rows={3}
                    placeholder="How does your product solve this problem?"
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>
                <FieldGroup label="Traction">
                  <textarea
                    value={form.traction}
                    onChange={(e) => updateField("traction", e.target.value)}
                    rows={2}
                    placeholder="Key metrics, users, revenue, partnerships..."
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FieldGroup>
                <FieldGroup label="Fundraising Status">
                  <select
                    value={form.fundraising}
                    onChange={(e) => updateField("fundraising", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select status</option>
                    {["Not yet fundraising", "Actively raising", "Closing round", "Recently closed"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Review Your Submission</h2>
              <p className="mt-1 text-sm text-muted-foreground">Make sure everything looks good before submitting</p>

              <div className="mt-6 flex flex-col gap-4">
                <ReviewRow label="Startup Name" value={form.startupName} />
                <ReviewRow label="Founder" value={form.founderName} />
                <ReviewRow label="School" value={form.school} />
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Sector" value={form.sector || "Not specified"} />
                <ReviewRow label="Stage" value={form.stage || "Not specified"} />
                <ReviewRow label="Website" value={form.website || "Not provided"} />
                <ReviewRow label="Pitch Deck" value={form.deckFile?.name || "Not uploaded"} />
                <ReviewRow label="One-Liner" value={form.oneLiner} />
                <ReviewRow label="Problem" value={form.problem} />
                <ReviewRow label="Solution" value={form.solution} />
                <ReviewRow label="Traction" value={form.traction || "Not provided"} />
                <ReviewRow label="Fundraising" value={form.fundraising || "Not specified"} />
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
                <Rocket className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-card-foreground">Pitch Submitted!</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {"Your pitch is now being analyzed by Demian's AI. You'll receive your score and feedback within minutes."}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI analysis in progress...
              </div>
              <Link
                href="/founder/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Go to Dashboard
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
                    Submitting...
                  </>
                ) : currentStep === 3 ? (
                  "Submit Pitch"
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
