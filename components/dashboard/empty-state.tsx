import { Users, Link2 } from "lucide-react"

interface EmptyStateProps {
  linkType: "server" | "profile"
}

export function EmptyState({ linkType }: EmptyStateProps) {
  const isServer = linkType === "server"

  return (
    <div className="p-12 rounded-xl bg-card/50 border border-dashed border-border text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        {isServer ? (
          <Users className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Link2 className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-semibold mb-1">No {isServer ? "server" : "profile"} links yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {isServer
          ? "Create your first dscd.sh shortlink to share your Discord server."
          : "Create your first dscd.me shortlink to share your Discord profile."}
      </p>
    </div>
  )
}
