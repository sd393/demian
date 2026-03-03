"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/lib/supabase/types"

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  // Validate role server-side
  if (role !== "founder" && role !== "investor") {
    return { error: "Invalid role. Must be 'founder' or 'investor'." }
  }

  const supabase = await createClient()

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Signup failed. Please try again." }
  }

  const admin = createAdminClient()

  // 2. Insert the profile row using the admin client (bypasses RLS)
  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: authData.user.id, role: role as UserRole })

  if (profileError) {
    return { error: "Failed to create profile. Please try again." }
  }

  // 3. Set role in app_metadata (secure — only service_role can write this)
  const { error: metaError } = await admin.auth.admin.updateUserById(
    authData.user.id,
    { app_metadata: { role } }
  )

  if (metaError) {
    return { error: "Failed to configure account. Please try again." }
  }

  // Redirect based on role
  if (role === "founder") {
    redirect("/founder/submit")
  } else {
    redirect("/investor/onboarding")
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const role = data.user?.app_metadata?.role as string | undefined

  if (role === "investor") {
    redirect("/investor/dashboard")
  } else {
    redirect("/founder/dashboard")
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function deleteAccount() {
  const supabase = await createClient()

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated." }
  }

  const admin = createAdminClient()

  // Delete the user — CASCADE will remove profiles, startups, investor_profiles, etc.
  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    return { error: "Failed to delete account. Please try again." }
  }

  // Clean up storage files for this user
  const { data: files } = await admin.storage
    .from("pitch-decks")
    .list(user.id)

  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`)
    await admin.storage.from("pitch-decks").remove(paths)
  }

  // Sign out locally and redirect
  await supabase.auth.signOut()
  redirect("/")
}
