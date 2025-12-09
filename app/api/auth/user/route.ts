import { NextResponse } from "next/server"
import { getOrCreateUserById } from "@/lib/auth"

// GET - Get or create user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const email = searchParams.get("email")
  const username = searchParams.get("username")
  const imageUrl = searchParams.get("imageUrl")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  try {
    const user = await getOrCreateUserById(userId, email || undefined, username || undefined, imageUrl || undefined)
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in auth/user route:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}
