import "server-only"
import { Dub } from "dub"

// Initialize Dub client
// You'll need to add DUB_API_KEY to your environment variables
export const dub = new Dub({
  token: process.env.DUB_API_KEY,
})

// Domain mappings for different link types
export const LINK_DOMAINS = {
  server: "dscd.sh",
  profile: "dscd.me",
} as const

// Create a shortlink in Dub.co
export async function createDubLink(params: {
  linkType: "server" | "profile"
  slug: string
  destinationUrl: string
  externalId: string
  title?: string
}) {
  const { linkType, slug, destinationUrl, externalId, title } = params
  const domain = LINK_DOMAINS[linkType]

  try {
    const result = await dub.links.create({
      domain,
      key: slug,
      url: destinationUrl,
      externalId,
      title: title || undefined,
      // Track referrers and enable analytics
      trackConversion: true,
    })

    return {
      success: true,
      linkId: result.id,
      shortLink: result.shortLink,
    }
  } catch (error) {
    console.error("Failed to create Dub link:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create shortlink",
    }
  }
}

// Delete a shortlink from Dub.co
export async function deleteDubLink(linkId: string) {
  try {
    await dub.links.delete(linkId)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete Dub link:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete shortlink",
    }
  }
}

// Update a shortlink in Dub.co
export async function updateDubLink(
  linkId: string,
  params: {
    url?: string
    key?: string
    title?: string
  },
) {
  try {
    const result = await dub.links.update(linkId, params)
    return {
      success: true,
      shortLink: result.shortLink,
    }
  } catch (error) {
    console.error("Failed to update Dub link:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update shortlink",
    }
  }
}

// Get analytics for a link from Dub.co
export async function getDubLinkAnalytics(linkId: string) {
  try {
    const analytics = await dub.analytics.retrieve({
      linkId,
      interval: "30d",
    })
    return {
      success: true,
      analytics,
    }
  } catch (error) {
    console.error("Failed to get Dub analytics:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get analytics",
    }
  }
}
