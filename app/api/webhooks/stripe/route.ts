import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle subscription events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    if (session.mode === "subscription" && session.metadata?.userId) {
      const userId = session.metadata.userId
      const tier = session.metadata.tier as "pro" | "business"
      const subscriptionId = session.subscription as string

      await sql`
        UPDATE users 
        SET tier = ${tier}, 
            stripe_subscription_id = ${subscriptionId},
            updated_at = NOW()
        WHERE id = ${userId}
      `
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object
    const customerId = subscription.customer as string

    // Get user by customer ID
    const users = await sql`
      SELECT id FROM users WHERE stripe_customer_id = ${customerId}
    `

    if (users.length > 0) {
      const userId = users[0].id

      // Check if subscription is active
      if (subscription.status === "active") {
        // Get the tier from metadata or default to 'pro'
        const tier = (subscription.metadata?.tier as "pro" | "business") || "pro"

        await sql`
          UPDATE users 
          SET tier = ${tier},
              stripe_subscription_id = ${subscription.id},
              updated_at = NOW()
          WHERE id = ${userId}
        `
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object
    const customerId = subscription.customer as string

    // Downgrade user to free tier
    await sql`
      UPDATE users 
      SET tier = 'free', 
          stripe_subscription_id = NULL,
          updated_at = NOW()
      WHERE stripe_customer_id = ${customerId}
    `
  }

  return NextResponse.json({ received: true })
}
