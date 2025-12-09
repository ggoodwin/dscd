"use client"

import { useState, useEffect } from "react"
import { useAuth, useUser } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TIER_LIMITS } from "@/lib/db"
import { PRODUCTS } from "@/lib/products"
import { Check, ExternalLink, Loader2 } from "lucide-react"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { createBillingPortalSession } from "@/app/actions/stripe"

export function SettingsContent() {
  const { userId } = useAuth()
  const { user: authUser } = useUser()
  const [data, setData] = useState<{ user: { tier: string; email: string } | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0])
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (authUser?.emailAddresses[0]?.emailAddress) {
          params.set("email", authUser.emailAddresses[0].emailAddress)
        }
        if (authUser?.username || authUser?.firstName) {
          params.set("username", authUser.username || authUser.firstName || "")
        }
        if (authUser?.imageUrl) {
          params.set("imageUrl", authUser.imageUrl)
        }

        const res = await fetch(`/api/user?${params.toString()}`, {
          headers: { "x-user-id": userId },
        })
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Failed to fetch user:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [userId, authUser])

  const user = data?.user
  const tier = user?.tier || "free"
  const tierLimits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]

  const handleUpgrade = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      setUpgradeOpen(true)
    }
  }

  const handleManageBilling = async () => {
    setLoadingPortal(true)
    try {
      const url = await createBillingPortalSession()
      window.open(url, "_blank")
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    } finally {
      setLoadingPortal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and subscription</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription and usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{tier} Plan</p>
              <p className="text-sm text-muted-foreground">
                {user?.email || authUser?.emailAddresses[0]?.emailAddress || "Not signed in"}
              </p>
            </div>
            <Badge variant={tier === "free" ? "secondary" : "default"} className="capitalize">
              {tier}
            </Badge>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Your limits:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                {tierLimits.maxLinks === -1 ? "Unlimited" : tierLimits.maxLinks} shortlinks
              </li>
              <li className="flex items-center gap-2">
                {tierLimits.customSlugs ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <span className="h-4 w-4 text-muted-foreground">-</span>
                )}
                Custom slugs
              </li>
              <li className="flex items-center gap-2">
                {tierLimits.analytics ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <span className="h-4 w-4 text-muted-foreground">-</span>
                )}
                Click analytics
              </li>
            </ul>
          </div>

          {tier !== "free" && (
            <Button variant="outline" onClick={handleManageBilling} disabled={loadingPortal}>
              {loadingPortal ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Billing
            </Button>
          )}
        </CardContent>
      </Card>

      {tier === "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>Get more links, custom slugs, and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-2xl font-bold mt-1">${(product.priceInCents / 100).toFixed(2)}/mo</p>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  <Button className="w-full mt-4" onClick={() => handleUpgrade(product.id)}>
                    Upgrade to {product.name}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <UpgradeDialog
        productId={selectedProduct.id}
        productName={selectedProduct.name}
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />
    </div>
  )
}
