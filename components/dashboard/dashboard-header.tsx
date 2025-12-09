"use client"

import Link from "next/link"
import { SignedIn, SignedOut } from "@/lib/auth-context"
import { UserButton } from "@/components/user-button"
import { Button } from "@/components/ui/button"
import { UserTierBadge } from "./user-tier-badge"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">D</span>
          </div>
          <span className="font-semibold text-lg">DSCD.app</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Links
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedIn>
            <UserTierBadge />
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}
