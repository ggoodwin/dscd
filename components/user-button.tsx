"use client"
import { useUser, useAuthActions } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"

export function UserButton({ afterSignOutUrl }: { afterSignOutUrl?: string }) {
  const { user } = useUser()
  const { signOut } = useAuthActions()

  const handleSignOut = () => {
    signOut()
    if (afterSignOutUrl) {
      window.location.href = afterSignOutUrl
    }
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || user?.firstName?.slice(0, 2).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.username || user?.firstName}</p>
          <p className="text-xs text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
