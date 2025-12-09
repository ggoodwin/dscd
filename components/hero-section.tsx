import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Link2, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Now in public beta
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
          Short links for your{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discord community
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          Create memorable shortlinks for Discord servers and profiles. Share{" "}
          <span className="font-mono text-accent">dscd.sh/your-server</span> or{" "}
          <span className="font-mono text-primary">dscd.me/username</span> anywhere.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Start Creating Links
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">View Pricing</Link>
          </Button>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <span className="font-mono text-sm text-accent">dscd.sh</span>
            </div>
            <p className="text-sm text-muted-foreground">For Discord server invite links</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <span className="font-mono text-sm text-primary">dscd.me</span>
            </div>
            <p className="text-sm text-muted-foreground">For Discord profile links</p>
          </div>
        </div>
      </div>
    </section>
  )
}
