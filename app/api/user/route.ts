import { NextResponse } from "next/server"
import { getOrCreateUserById } from "@/lib/auth"

function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get("x-user-id")
}

// GET /api/user - Get current user info
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request)

  if (!userId) {
    return NextResponse.json({ user: null })
  }

  try {
    // Get user info from query params if provided
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const username = searchParams.get("username")
    const imageUrl = searchParams.get("imageUrl")

    const user = await getOrCreateUserById(userId, email || undefined, username || undefined, imageUrl || undefined)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Return safe user data (no sensitive fields)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        image_url: user.image_url,
        tier: user.tier,
      },
    })
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return NextResponse.json({ user: null })
  }
}
