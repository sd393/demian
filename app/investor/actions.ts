"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function submitInvestorProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "investor") {
    return { error: "Only investors can create investor profiles." }
  }

  const investorName = formData.get("investorName") as string
  const firmName = formData.get("firmName") as string
  const role = (formData.get("role") as string) || null
  const linkedinUrl = (formData.get("linkedinUrl") as string) || null
  const sectors = JSON.parse(formData.get("sectors") as string) as string[]
  const stages = JSON.parse(formData.get("stages") as string) as string[]
  const checkSizeMin = (formData.get("checkSizeMin") as string) || null
  const checkSizeMax = (formData.get("checkSizeMax") as string) || null
  const geography = JSON.parse(formData.get("geography") as string) as string[]
  const thesis = (formData.get("thesis") as string) || null
  const notInterested = (formData.get("notInterested") as string) || null

  if (!investorName || !firmName || !sectors || sectors.length === 0) {
    return { error: "Missing required fields." }
  }

  // Check if profile already exists (update vs insert)
  const { data: existing } = await supabase
    .from("investor_profiles")
    .select("id")
    .eq("investor_id", user.id)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("investor_profiles")
      .update({
        investor_name: investorName,
        firm_name: firmName,
        role,
        linkedin_url: linkedinUrl,
        sectors,
        stages: stages.length > 0 ? stages : null,
        check_size_min: checkSizeMin,
        check_size_max: checkSizeMax,
        geography: geography.length > 0 ? geography : null,
        thesis,
        not_interested: notInterested,
      })
      .eq("id", existing.id)

    if (error) {
      return { error: "Failed to update profile. Please try again." }
    }
  } else {
    const { error } = await supabase.from("investor_profiles").insert({
      investor_id: user.id,
      investor_name: investorName,
      firm_name: firmName,
      role,
      linkedin_url: linkedinUrl,
      sectors,
      stages: stages.length > 0 ? stages : null,
      check_size_min: checkSizeMin,
      check_size_max: checkSizeMax,
      geography: geography.length > 0 ? geography : null,
      thesis,
      not_interested: notInterested,
    })

    if (error) {
      return { error: "Failed to create profile. Please try again." }
    }
  }

  redirect("/investor/dashboard")
}

export async function toggleSaveStartup(startupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated." }
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from("saved_startups")
    .select("startup_id")
    .eq("investor_id", user.id)
    .eq("startup_id", startupId)
    .single()

  if (existing) {
    // Unsave
    await supabase
      .from("saved_startups")
      .delete()
      .eq("investor_id", user.id)
      .eq("startup_id", startupId)

    return { saved: false }
  } else {
    // Save
    await supabase.from("saved_startups").insert({
      investor_id: user.id,
      startup_id: startupId,
    })

    return { saved: true }
  }
}

export async function recordStartupView(startupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  // Only record if the user is an investor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "investor") return

  await supabase.from("startup_views").insert({
    investor_id: user.id,
    startup_id: startupId,
  })
}
