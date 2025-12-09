import { BarChart3, Globe, Link2, QrCode, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Link2,
    title: "Branded Shortlinks",
    description: "Get memorable dscd.sh and dscd.me links that represent your community.",
  },
  {
    icon: BarChart3,
    title: "Click Analytics",
    description: "Track clicks, locations, and referrers to understand your audience.",
  },
  {
    icon: QrCode,
    title: "QR Codes",
    description: "Generate QR codes for your links to use on streams and social media.",
  },
  {
    icon: Globe,
    title: "Custom Slugs",
    description: "Choose your own slug like dscd.sh/gaming or dscd.me/john for easy sharing.",
  },
  {
    icon: Shield,
    title: "Link Management",
    description: "Edit, disable, or delete links anytime. Full control over your links.",
  },
  {
    icon: Zap,
    title: "Instant Redirects",
    description: "Lightning-fast redirects powered by edge infrastructure worldwide.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-card/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features to help you share and track your Discord community links.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
