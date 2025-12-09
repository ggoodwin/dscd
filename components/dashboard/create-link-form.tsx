"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Link2, Loader2 } from "lucide-react"

interface CreateLinkFormProps {
  defaultType: "server" | "profile"
  onSuccess?: () => void
}

export function CreateLinkForm({ defaultType, onSuccess }: CreateLinkFormProps) {
  const router = useRouter()
  const { userId } = useAuth()
  const { user } = useUser()

  const [linkType, setLinkType] = useState<"server" | "profile">(defaultType)
  const [destinationUrl, setDestinationUrl] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresAuth, setRequiresAuth] = useState(false)

  const isServer = linkType === "server"
  const placeholder = isServer ? "https://discord.gg/your-invite" : "https://discord.com/users/123456789"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!userId) {
      setRequiresAuth(true)
      setError("Please sign in to create shortlinks")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          linkType,
          destinationUrl,
          slug: customSlug || undefined,
          title: title || undefined,
          userEmail: user?.emailAddresses[0]?.emailAddress,
          userName: user?.username || user?.firstName,
          userImage: user?.imageUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setRequiresAuth(true)
          setError("Please sign in to create shortlinks")
        } else {
          setError(data.error || "Failed to create link")
        }
        return
      }

      window.dispatchEvent(new CustomEvent(`refetch-links-${linkType}`))
      onSuccess?.()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (requiresAuth) {
    return (
      <div className="space-y-4 py-4">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <p className="text-sm mb-4">Sign in to create your first shortlink</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push("/sign-in")}>
              Sign In
            </Button>
            <Button onClick={() => router.push("/sign-up")}>Sign Up</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <Tabs value={linkType} onValueChange={(v) => setLinkType(v as "server" | "profile")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="server" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            dscd.sh
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            dscd.me
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="destination">Discord URL</Label>
        <Input
          id="destination"
          type="url"
          placeholder={placeholder}
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          {isServer ? "Paste your Discord server invite link" : "Paste your Discord profile URL"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Custom Slug (optional)</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">{isServer ? "dscd.sh/" : "dscd.me/"}</span>
          <Input
            id="slug"
            placeholder="your-slug"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          />
        </div>
        <p className="text-xs text-muted-foreground">Leave empty for a random slug. Custom slugs require Pro plan.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" placeholder="My Discord Server" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Shortlink"
        )}
      </Button>
    </form>
  )
}
