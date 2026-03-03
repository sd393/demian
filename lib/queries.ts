import { createClient } from "@/lib/supabase/server"

export async function getFounderDashboardData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get the founder's startup
  const { data: startup } = await supabase
    .from("startups")
    .select("*")
    .eq("founder_id", user.id)
    .single()

  if (!startup) return { startup: null, pitchVersions: [], viewCount: 0 }

  // Get pitch versions
  const { data: pitchVersions } = await supabase
    .from("pitch_versions")
    .select("*")
    .eq("startup_id", startup.id)
    .order("version", { ascending: false })

  // Get view count
  const { count: viewCount } = await supabase
    .from("startup_views")
    .select("*", { count: "exact", head: true })
    .eq("startup_id", startup.id)

  return {
    startup,
    pitchVersions: pitchVersions ?? [],
    viewCount: viewCount ?? 0,
  }
}

export async function getInvestorDashboardData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get investor profile
  const { data: investorProfile } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("investor_id", user.id)
    .single()

  // Get all startups (investors can see all)
  const { data: startups } = await supabase
    .from("startups")
    .select("*")
    .order("created_at", { ascending: false })

  // Get saved startup IDs
  const { data: savedRows } = await supabase
    .from("saved_startups")
    .select("startup_id")
    .eq("investor_id", user.id)

  const savedIds = new Set(savedRows?.map((r) => r.startup_id) ?? [])

  return {
    investorProfile,
    startups: startups ?? [],
    savedIds,
  }
}

export async function getStartupDetail(startupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get the startup
  const { data: startup } = await supabase
    .from("startups")
    .select("*")
    .eq("id", startupId)
    .single()

  if (!startup) return null

  // Get pitch versions for this startup
  const { data: pitchVersions } = await supabase
    .from("pitch_versions")
    .select("*")
    .eq("startup_id", startupId)
    .order("version", { ascending: false })

  // Check if saved by this investor
  const { data: savedRow } = await supabase
    .from("saved_startups")
    .select("startup_id")
    .eq("investor_id", user.id)
    .eq("startup_id", startupId)
    .single()

  // Get similar startups (same sector, excluding this one)
  const { data: similarStartups } = await supabase
    .from("startups")
    .select("id, startup_name, sector, stage, pitch_score, founder_name")
    .neq("id", startupId)
    .limit(3)

  // Get view count
  const { count: viewCount } = await supabase
    .from("startup_views")
    .select("*", { count: "exact", head: true })
    .eq("startup_id", startupId)

  return {
    startup,
    pitchVersions: pitchVersions ?? [],
    isSaved: !!savedRow,
    similarStartups: similarStartups ?? [],
    viewCount: viewCount ?? 0,
    userId: user.id,
    userRole: user.app_metadata?.role as string | undefined,
  }
}

export async function getDeckSignedUrl(deckPath: string) {
  const supabase = await createClient()

  const { data } = await supabase.storage
    .from("pitch-decks")
    .createSignedUrl(deckPath, 3600) // 1 hour expiry

  return data?.signedUrl ?? null
}
