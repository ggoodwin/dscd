import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

// User types
export interface User {
  id: string
  email: string
  username: string | null
  image_url: string | null
  tier: "free" | "pro" | "business"
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: Date
  updated_at: Date
}

// Shortlink types
export interface Shortlink {
  id: string
  user_id: string
  link_type: "server" | "profile"
  slug: string
  destination_url: string
  dub_link_id: string | null
  title: string | null
  description: string | null
  clicks: number
  created_at: Date
  updated_at: Date
}

// Click analytics types
export interface ClickAnalytics {
  id: string
  shortlink_id: string
  clicked_at: Date
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  referer: string | null
}

// Tier limits
export const TIER_LIMITS = {
  free: {
    maxLinks: 5,
    analytics: false,
    customSlugs: false,
    prioritySupport: false,
  },
  pro: {
    maxLinks: 50,
    analytics: true,
    customSlugs: true,
    prioritySupport: false,
  },
  business: {
    maxLinks: -1, // unlimited
    analytics: true,
    customSlugs: true,
    prioritySupport: true,
  },
} as const
