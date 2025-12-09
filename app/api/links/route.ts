import { NextResponse } from "next/server"
import { sql, TIER_LIMITS } from "@/lib/db"
import { nanoid } from "nanoid"
import { getOrCreateUserById, getUserById } from "@/lib/auth"
import { createDubLink, LINK_DOMAINS } from "@/lib/dub"

function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get("x-user-id")
}

// GET /api/links - Get user's links
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const linkType = searchParams.get("type") || "server"
  const userId = getUserIdFromRequest(request)

  try {
    if (!userId) {
      return NextResponse.json({ links: [] })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ links: [] })
    }

    const links = await sql`
      SELECT * FROM shortlinks 
      WHERE user_id = ${user.id} AND link_type = ${linkType}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ links })
  } catch (error) {
    console.error("Failed to fetch links:", error)
    return NextResponse.json({ links: [] })
  }
}

// POST /api/links - Create a new link
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { linkType, destinationUrl, slug, title, userEmail, userName, userImage } = body

    // Get or create user
    const user = await getOrCreateUserById(userId, userEmail, userName, userImage)

    if (!user) {
      return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
    }

    // Validate link type
    if (!["server", "profile"].includes(linkType)) {
      return NextResponse.json({ error: "Invalid link type" }, { status: 400 })
    }

    // Validate destination URL
    if (
      linkType === "server" &&
      !destinationUrl.includes("discord.gg") &&
      !destinationUrl.includes("discord.com/invite")
    ) {
      return NextResponse.json({ error: "Server links must use Discord invite URLs" }, { status: 400 })
    }

    if (linkType === "profile" && !destinationUrl.includes("discord.com/users")) {
      return NextResponse.json({ error: "Profile links must use discord.com/users URLs" }, { status: 400 })
    }

    // Check link limits
    const linkCount = await sql`
      SELECT COUNT(*) as count FROM shortlinks WHERE user_id = ${user.id}
    `
    const currentCount = Number.parseInt(linkCount[0].count)
    const tierLimits = TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS]
    const limit = tierLimits.maxLinks

    if (limit !== -1 && currentCount >= limit) {
      return NextResponse.json(
        { error: `You've reached your limit of ${limit} links. Upgrade to create more.` },
        { status: 403 },
      )
    }

    // Check custom slug permission
    const finalSlug = slug || nanoid(8)
    if (slug && !tierLimits.customSlugs) {
      return NextResponse.json({ error: "Custom slugs require a Pro plan" }, { status: 403 })
    }

    // Check if slug is already taken
    const existingSlug = await sql`
      SELECT id FROM shortlinks WHERE link_type = ${linkType} AND slug = ${finalSlug}
    `

    if (existingSlug.length > 0) {
      return NextResponse.json({ error: "This slug is already taken" }, { status: 409 })
    }

    // Create the link in database first
    const linkId = nanoid(12)

    const dubResult = await createDubLink({
      linkType: linkType as "server" | "profile",
      slug: finalSlug,
      destinationUrl,
      externalId: linkId,
      title,
    })

    if (!dubResult.success) {
      return NextResponse.json({ error: dubResult.error || "Failed to create shortlink" }, { status: 500 })
    }

    const newLink = await sql`
      INSERT INTO shortlinks (id, user_id, link_type, slug, destination_url, title, dub_link_id)
      VALUES (${linkId}, ${user.id}, ${linkType}, ${finalSlug}, ${destinationUrl}, ${title}, ${dubResult.linkId})
      RETURNING *
    `

    // Add the short URL to the response
    const domain = LINK_DOMAINS[linkType as keyof typeof LINK_DOMAINS]
    const responseLink = {
      ...newLink[0],
      shortUrl: `https://${domain}/${finalSlug}`,
    }

    return NextResponse.json({ link: responseLink }, { status: 201 })
  } catch (error) {
    console.error("Failed to create link:", error)
    const errorMessage =
      error instanceof Error && error.message.includes("does not exist")
        ? "Database not configured. Please run the setup script."
        : "Failed to create link"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
