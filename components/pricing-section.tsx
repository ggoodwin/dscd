import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PRODUCTS } from "@/lib/products"
import Link from "next/link"

const freePlan = {
  name: "Free",
  price: "$0",
  description: "Perfect for getting started",
  features: ["5 shortlinks", "Basic link management", "Standard redirects", "Community support"],
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free and upgrade as your community grows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="p-6 rounded-xl bg-card border border-border flex flex-col">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-1">{freePlan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{freePlan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{freePlan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {freePlan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>

          {/* Paid Plans */}
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`p-6 rounded-xl flex flex-col ${
                product.popular ? "bg-primary/5 border-2 border-primary relative" : "bg-card border border-border"
              }`}
            >
              {product.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${(product.priceInCents / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={product.popular ? "default" : "outline"} asChild>
                <Link href={`/dashboard?upgrade=${product.tier}`}>Upgrade to {product.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
