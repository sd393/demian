"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function ChatNavbar() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  async function handleLogout() {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="flex-shrink-0 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-bold tracking-tight text-foreground">
          Vera
        </a>
        <div className="flex items-center gap-4">
          {user?.displayName && (
            <span className="text-sm text-muted-foreground">
              {user.displayName}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
