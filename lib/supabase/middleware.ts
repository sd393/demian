import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — this is the critical call that keeps the session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ["/", "/auth/login", "/auth/signup"]
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/auth/")
  )

  // If not authenticated and trying to access a protected route → redirect to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If authenticated and visiting auth pages → redirect based on role
  if (user && pathname.startsWith("/auth/")) {
    const role = user.app_metadata?.role as string | undefined
    const url = request.nextUrl.clone()
    url.pathname =
      role === "investor" ? "/investor/dashboard" : "/founder/dashboard"
    return NextResponse.redirect(url)
  }

  // Role-based route protection (UX only — RLS is the real security boundary)
  if (user) {
    const role = user.app_metadata?.role as string | undefined

    if (pathname.startsWith("/founder") && role === "investor") {
      const url = request.nextUrl.clone()
      url.pathname = "/investor/dashboard"
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith("/investor") && role === "founder") {
      const url = request.nextUrl.clone()
      url.pathname = "/founder/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
