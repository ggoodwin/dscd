import { NextResponse } from "next/server"
import { sql, TIER_LIMITS } from "@/lib/db"
import { getOrCreateUser } from "@/lib/auth"
import { getDubLinkAnalytics } from "@/lib/dub"

// GET /api/links/[id]/analytics - Get analytics for a link
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOrCreateUser()
  const { id } = await params

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user has analytics access
  const tierLimits = TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS]
  if (!tierLimits.analytics) {
    return NextResponse.json({ error: "Analytics require a Pro plan" }, { status: 403 })
  }

  try {
    // Check if link belongs to user
    const link = await sql`
      SELECT * FROM shortlinks WHERE id = ${id} AND user_id = ${user.id}
    `

    if (link.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    const linkData = link[0]

    if (!linkData.dub_link_id) {
      return NextResponse.json({ error: "Analytics not available for this link" }, { status: 404 })
    }

    const analyticsResult = await getDubLinkAnalytics(linkData.dub_link_id)

    if (!analyticsResult.success) {
      return NextResponse.json({ error: analyticsResult.error }, { status: 500 })
    }

    return NextResponse.json({ analytics: analyticsResult.analytics })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
