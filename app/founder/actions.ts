"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createSignedUploadUrl(fileName: string, fileType: string) {
  const supabase = await createClient()

  // Verify the user is an authenticated founder
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

  if (!profile || profile.role !== "founder") {
    return { error: "Only founders can upload pitch decks." }
  }

  // Validate file type
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
  ]
  if (!allowed.includes(fileType)) {
    return { error: "Invalid file type. Only PDF and PPTX files are allowed." }
  }

  // Determine version number
  const { data: existing } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", user.id)
    .single()

  let version = 1
  if (existing) {
    const { count } = await supabase
      .from("pitch_versions")
      .select("*", { count: "exact", head: true })
      .eq("startup_id", existing.id)

    version = (count ?? 0) + 1
  }

  // Generate the storage path
  const ext = fileName.split(".").pop() || "pdf"
  const deckPath = `${user.id}/deck_v${version}.${ext}`

  // Create a signed upload URL
  const { data, error } = await supabase.storage
    .from("pitch-decks")
    .createSignedUploadUrl(deckPath)

  if (error) {
    return { error: "Failed to create upload URL. Please try again." }
  }

  return { signedUrl: data.signedUrl, deckPath, token: data.token }
}

export async function submitPitch(formData: FormData) {
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

  if (!profile || profile.role !== "founder") {
    return { error: "Only founders can submit pitches." }
  }

  const startupName = formData.get("startupName") as string
  const founderName = formData.get("founderName") as string
  const school = formData.get("school") as string
  const email = formData.get("email") as string
  const sector = (formData.get("sector") as string) || null
  const stage = (formData.get("stage") as string) || null
  const website = (formData.get("website") as string) || null
  const oneLiner = formData.get("oneLiner") as string
  const problem = formData.get("problem") as string
  const solution = formData.get("solution") as string
  const traction = (formData.get("traction") as string) || null
  const fundraising = (formData.get("fundraising") as string) || null
  const deckPath = (formData.get("deckPath") as string) || null

  // Validate required fields
  if (!startupName || !founderName || !school || !email || !oneLiner || !problem || !solution) {
    return { error: "Missing required fields." }
  }

  // Check if founder already has a startup (update instead of insert)
  const { data: existing } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", user.id)
    .single()

  if (existing) {
    // Update existing startup
    const { error } = await supabase
      .from("startups")
      .update({
        startup_name: startupName,
        founder_name: founderName,
        school,
        email,
        sector,
        stage,
        website,
        one_liner: oneLiner,
        problem,
        solution,
        traction,
        fundraising,
        deck_path: deckPath,
      })
      .eq("id", existing.id)

    if (error) {
      return { error: "Failed to update pitch. Please try again." }
    }

    // Insert a new pitch version record
    if (deckPath) {
      const { count } = await supabase
        .from("pitch_versions")
        .select("*", { count: "exact", head: true })
        .eq("startup_id", existing.id)

      await supabase.from("pitch_versions").insert({
        startup_id: existing.id,
        version: (count ?? 0) + 1,
        deck_path: deckPath,
      })
    }
  } else {
    // Insert new startup
    const { data: newStartup, error } = await supabase
      .from("startups")
      .insert({
        founder_id: user.id,
        startup_name: startupName,
        founder_name: founderName,
        school,
        email,
        sector,
        stage,
        website,
        one_liner: oneLiner,
        problem,
        solution,
        traction,
        fundraising,
        deck_path: deckPath,
      })
      .select("id")
      .single()

    if (error) {
      return { error: "Failed to submit pitch. Please try again." }
    }

    // Insert first pitch version
    if (deckPath && newStartup) {
      await supabase.from("pitch_versions").insert({
        startup_id: newStartup.id,
        version: 1,
        deck_path: deckPath,
      })
    }
  }

  redirect("/founder/dashboard")
}

export async function reuploadDeck(fileName: string, fileType: string) {
  // Same as createSignedUploadUrl but ensures a startup already exists
  return createSignedUploadUrl(fileName, fileType)
}

export async function updateDeckPath(deckPath: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated." }
  }

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", user.id)
    .single()

  if (!startup) {
    return { error: "No startup found." }
  }

  // Update deck path on the startup
  await supabase
    .from("startups")
    .update({ deck_path: deckPath })
    .eq("id", startup.id)

  // Insert a new pitch version
  const { count } = await supabase
    .from("pitch_versions")
    .select("*", { count: "exact", head: true })
    .eq("startup_id", startup.id)

  await supabase.from("pitch_versions").insert({
    startup_id: startup.id,
    version: (count ?? 0) + 1,
    deck_path: deckPath,
  })

  return { success: true }
}
