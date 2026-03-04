import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/lib/supabase/types"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const role = searchParams.get("role")
  const errorParam = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  // User denied consent on Google's screen
  if (errorParam) {
    const message = errorDescription || "OAuth sign-in was cancelled."
    const redirectPath = role ? "/auth/signup" : "/auth/login"
    return NextResponse.redirect(
      `${siteUrl}${redirectPath}?error=${encodeURIComponent(message)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${siteUrl}/auth/login?error=${encodeURIComponent("Missing authorization code.")}`
    )
  }

  // Build a Supabase client that can read/write cookies on the response
  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Exchange the authorization code for a session (PKCE flow)
  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !sessionData.user) {
    return NextResponse.redirect(
      `${siteUrl}/auth/login?error=${encodeURIComponent("Failed to sign in. Please try again.")}`
    )
  }

  const user = sessionData.user
  const admin = createAdminClient()

  // Check if this user already has a profile (returning user)
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile) {
    // Returning user — redirect to their dashboard
    const dashboardPath =
      profile.role === "investor" ? "/investor/dashboard" : "/founder/dashboard"
    return buildRedirect(siteUrl + dashboardPath, response)
  }

  // New user — need to create a profile
  if (role === "founder" || role === "investor") {
    // Came from signup page with a role selected
    const validRole = role as UserRole

    const { error: profileError } = await admin
      .from("profiles")
      .insert({ id: user.id, role: validRole })

    if (profileError) {
      // Clean up: sign user out so they can retry
      await supabase.auth.signOut()
      return NextResponse.redirect(
        `${siteUrl}/auth/signup?error=${encodeURIComponent("Failed to create profile. Please try again.")}`
      )
    }

    const { error: metaError } = await admin.auth.admin.updateUserById(
      user.id,
      { app_metadata: { role: validRole } }
    )

    if (metaError) {
      await supabase.auth.signOut()
      return NextResponse.redirect(
        `${siteUrl}/auth/signup?error=${encodeURIComponent("Failed to configure account. Please try again.")}`
      )
    }

    const onboardingPath =
      validRole === "founder" ? "/founder/submit" : "/investor/onboarding"
    return buildRedirect(siteUrl + onboardingPath, response)
  }

  // New user from login page (no role) — send to role selection
  return buildRedirect(siteUrl + "/auth/choose-role", response)
}

/**
 * Build a redirect response that preserves the Set-Cookie headers
 * from the Supabase session exchange.
 */
function buildRedirect(url: string, cookieResponse: NextResponse) {
  const redirect = NextResponse.redirect(url)
  cookieResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value)
  })
  return redirect
}
