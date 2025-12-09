"use client"

import { useState, useEffect } from "react"
import { useAuth, useUser } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Sparkles } from "lucide-react"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { PRODUCTS } from "@/lib/products"

export function UserTierBadge() {
  const { userId } = useAuth()
  const { user } = useUser()
  const [data, setData] = useState<{ user: { tier: string } | null } | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0])

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return

      try {
        const params = new URLSearchParams()
        if (user?.emailAddresses[0]?.emailAddress) {
          params.set("email", user.emailAddresses[0].emailAddress)
        }
        if (user?.username || user?.firstName) {
          params.set("username", user.username || user.firstName || "")
        }
        if (user?.imageUrl) {
          params.set("imageUrl", user.imageUrl)
        }

        const res = await fetch(`/api/user?${params.toString()}`, {
          headers: { "x-user-id": userId },
        })
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Failed to fetch user:", err)
      }
    }
    fetchUser()
  }, [userId, user])

  const tier = data?.user?.tier || "free"

  const handleUpgrade = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      setUpgradeOpen(true)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {tier === "free" && (
          <>
            <Badge variant="secondary" className="text-xs">
              Free
            </Badge>
            <Button variant="outline" size="sm" onClick={() => handleUpgrade("dscd-pro-monthly")}>
              <Sparkles className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </>
        )}

        {tier === "pro" && (
          <Badge className="bg-primary text-primary-foreground text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        )}

        {tier === "business" && (
          <Badge className="bg-accent text-accent-foreground text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Business
          </Badge>
        )}
      </div>

      <UpgradeDialog
        productId={selectedProduct.id}
        productName={selectedProduct.name}
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />
    </>
  )
}
