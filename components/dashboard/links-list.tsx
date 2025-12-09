"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import type { Shortlink } from "@/lib/db"
import { LinkCard } from "@/components/dashboard/link-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Skeleton } from "@/components/ui/skeleton"

interface LinksListProps {
  linkType: "server" | "profile"
}

export function LinksList({ linkType }: LinksListProps) {
  const { userId } = useAuth()
  const [data, setData] = useState<{ links: Shortlink[] } | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchLinks = useCallback(async () => {
    try {
      setIsLoading(true)
      const headers: HeadersInit = {}
      if (userId) {
        headers["x-user-id"] = userId
      }
      const res = await fetch(`/api/links?type=${linkType}`, { headers })
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setData({ links: [] })
    } finally {
      setIsLoading(false)
    }
  }, [linkType, userId])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  // Expose refetch method for child components
  useEffect(() => {
    const handleRefetch = () => fetchLinks()
    window.addEventListener(`refetch-links-${linkType}`, handleRefetch)
    return () => window.removeEventListener(`refetch-links-${linkType}`, handleRefetch)
  }, [linkType, fetchLinks])

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data?.links || data.links.length === 0) {
    return <EmptyState linkType={linkType} />
  }

  return (
    <div className="grid gap-4">
      {data.links.map((link) => (
        <LinkCard key={link.id} link={link} onUpdate={fetchLinks} />
      ))}
    </div>
  )
}
