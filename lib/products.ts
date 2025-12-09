export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  tier: "pro" | "business"
  features: string[]
  popular?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: "dscd-pro-monthly",
    name: "Pro",
    description: "For active Discord community managers",
    priceInCents: 499, // $4.99/month
    tier: "pro",
    popular: true,
    features: ["50 shortlinks", "Custom slugs", "Click analytics", "Link editing", "QR codes"],
  },
  {
    id: "dscd-business-monthly",
    name: "Business",
    description: "For agencies and large communities",
    priceInCents: 1499, // $14.99/month
    tier: "business",
    features: ["Unlimited shortlinks", "Advanced analytics", "Priority support", "API access", "Team collaboration"],
  },
]
