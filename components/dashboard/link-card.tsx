"use client"

import type { Shortlink } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, BarChart3, MoreHorizontal, Trash2, Pencil, QrCode } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { EditLinkDialog } from "./edit-link-dialog"
import { QRCodeDialog } from "./qr-code-dialog"

interface LinkCardProps {
  link: Shortlink
  onUpdate?: () => void
}

export function LinkCard({ link, onUpdate }: LinkCardProps) {
  const { userId } = useAuth()
  const [copying, setCopying] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const shortUrl = link.link_type === "server" ? `dscd.sh/${link.slug}` : `dscd.me/${link.slug}`

  const copyToClipboard = async () => {
    setCopying(true)
    await navigator.clipboard.writeText(`https://${shortUrl}`)
    setTimeout(() => setCopying(false), 1500)
  }

  const deleteLink = async () => {
    if (!confirm("Are you sure you want to delete this link?")) return

    const headers: HeadersInit = {}
    if (userId) {
      headers["x-user-id"] = userId
    }
    await fetch(`/api/links/${link.id}`, { method: "DELETE", headers })
    onUpdate?.()
  }

  return (
    <>
      <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium text-primary truncate">{shortUrl}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={copyToClipboard}>
                <Copy className="h-3 w-3" />
              </Button>
              {copying && <span className="text-xs text-accent">Copied!</span>}
            </div>

            {link.title && <p className="font-medium text-sm truncate mb-1">{link.title}</p>}

            <p className="text-xs text-muted-foreground truncate">{link.destination_url}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              <span>{link.clicks} clicks</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setQrOpen(true)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={link.destination_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Destination
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteLink} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <EditLinkDialog link={link} open={editOpen} onOpenChange={setEditOpen} onUpdate={onUpdate} />
      <QRCodeDialog shortUrl={`https://${shortUrl}`} open={qrOpen} onOpenChange={setQrOpen} />
    </>
  )
}
