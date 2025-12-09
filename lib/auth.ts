import { sql, type User } from "@/lib/db"

// Get or create user in database - called from API routes with userId from client
export async function getOrCreateUserById(
  userId: string,
  email?: string,
  username?: string,
  imageUrl?: string,
): Promise<User | null> {
  if (!userId) {
    return null
  }

  try {
    // Check if user exists in database
    const existingUser = await sql`SELECT * FROM users WHERE id = ${userId}`

    if (existingUser.length > 0) {
      return existingUser[0] as User
    }

    // Create user in database
    const newUser = await sql`
      INSERT INTO users (id, email, username, image_url)
      VALUES (
        ${userId},
        ${email || ""},
        ${username || "user"},
        ${imageUrl || ""}
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
      RETURNING *
    `

    return newUser[0] as User
  } catch (error) {
    console.error("Error getting/creating user:", error)
    return null
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  if (!userId) return null

  try {
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`
    return result.length > 0 ? (result[0] as User) : null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}
