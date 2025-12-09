import { Webhook } from "svix"
import { headers } from "next/headers"
import { sql } from "@/lib/db"

interface WebhookEvent {
  type: string
  data: {
    id?: string
    email_addresses?: { email_address: string }[]
    username?: string | null
    image_url?: string
  }
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response("Clerk webhook not configured", { status: 200 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }

  // Handle user events
  if (evt.type === "user.created") {
    const { id, email_addresses, username, image_url } = evt.data

    if (id) {
      await sql`
        INSERT INTO users (id, email, username, image_url)
        VALUES (${id}, ${email_addresses?.[0]?.email_address || ""}, ${username}, ${image_url})
        ON CONFLICT (id) DO NOTHING
      `
    }
  }

  if (evt.type === "user.updated") {
    const { id, email_addresses, username, image_url } = evt.data

    if (id) {
      await sql`
        UPDATE users 
        SET email = ${email_addresses?.[0]?.email_address || ""}, 
            username = ${username}, 
            image_url = ${image_url},
            updated_at = NOW()
        WHERE id = ${id}
      `
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data
    if (id) {
      await sql`DELETE FROM users WHERE id = ${id}`
    }
  }

  return new Response("OK", { status: 200 })
}
