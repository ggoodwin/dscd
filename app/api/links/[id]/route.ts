import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { deleteDubLink, updateDubLink } from "@/lib/dub"

function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get("x-user-id")
}

// GET /api/links/[id] - Get a specific link
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request)
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const link = await sql`
      SELECT * FROM shortlinks WHERE id = ${id} AND user_id = ${userId}
    `

    if (link.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json({ link: link[0] })
  } catch (error) {
    console.error("Failed to fetch link:", error)
    return NextResponse.json({ error: "Failed to fetch link" }, { status: 500 })
  }
}

// PATCH /api/links/[id] - Update a link
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request)
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { destinationUrl, title } = body

    // Check if link belongs to user
    const existingLink = await sql`
      SELECT * FROM shortlinks WHERE id = ${id} AND user_id = ${userId}
    `

    if (existingLink.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    const link = existingLink[0]

    // Update in Dub.co if we have a dub_link_id
    if (link.dub_link_id) {
      const dubResult = await updateDubLink(link.dub_link_id, {
        url: destinationUrl,
        title,
      })

      if (!dubResult.success) {
        return NextResponse.json({ error: dubResult.error || "Failed to update shortlink" }, { status: 500 })
      }
    }

    // Update in database
    const updatedLink = await sql`
      UPDATE shortlinks 
      SET destination_url = COALESCE(${destinationUrl}, destination_url),
          title = COALESCE(${title}, title),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ link: updatedLink[0] })
  } catch (error) {
    console.error("Failed to update link:", error)
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 })
  }
}

// DELETE /api/links/[id] - Delete a link
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request)
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if link belongs to user
    const link = await sql`
      SELECT * FROM shortlinks WHERE id = ${id} AND user_id = ${userId}
    `

    if (link.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Delete from Dub.co if we have a dub_link_id
    if (link[0].dub_link_id) {
      await deleteDubLink(link[0].dub_link_id)
    }

    // Delete from database
    await sql`DELETE FROM shortlinks WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete link:", error)
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 })
  }
}
