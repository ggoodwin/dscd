"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"
import { getOrCreateUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function createCheckoutSession(productId: string) {
  const user = await getOrCreateUser()

  if (!user) {
    throw new Error("You must be signed in to upgrade")
  }

  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Get or create Stripe customer
  let customerId = user.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
      },
    })
    customerId = customer.id

    // Save customer ID to database
    await sql`
      UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}
    `
  }

  // Create checkout session for subscription
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `DSCD ${product.name}`,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      userId: user.id,
      tier: product.tier,
    },
  })

  return session.client_secret
}

export async function createBillingPortalSession() {
  const user = await getOrCreateUser()

  if (!user || !user.stripe_customer_id) {
    throw new Error("No subscription found")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
  })

  return session.url
}
