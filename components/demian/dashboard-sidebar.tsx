"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Zap, X, LogOut, Trash2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signOut, deleteAccount } from "@/app/auth/actions"
import { useState } from "react"

interface SidebarLink {
  href: string
  label: string
  icon: LucideIcon
}

interface DashboardSidebarProps {
  links: SidebarLink[]
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({ links, open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const displayName = user?.email?.split("@")[0] ?? "User"
  const displayEmail = user?.email ?? ""

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">Demian</span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-sidebar-primary/10 text-sidebar-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-sidebar-foreground">{displayName}</span>
              <span className="block truncate text-xs text-muted-foreground">{displayEmail}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs text-destructive">This will permanently delete your account and all data.</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={async () => {
                      await deleteAccount()
                    }}
                    className="flex-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
