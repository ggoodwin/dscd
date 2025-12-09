"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useEffect, useRef } from "react"

interface QRCodeDialogProps {
  shortUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeDialog({ shortUrl, open, onOpenChange }: QRCodeDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!open || !canvasRef.current) return

    // Simple QR code generation using a service
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d")
      if (ctx && canvasRef.current) {
        canvasRef.current.width = 200
        canvasRef.current.height = 200
        ctx.drawImage(img, 0, 0)
      }
    }
  }, [open, shortUrl])

  const downloadQR = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `qr-${shortUrl.replace(/https?:\/\//, "").replace(/\//g, "-")}.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription className="font-mono text-xs break-all">{shortUrl}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 bg-white rounded-lg">
            <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
          </div>

          <Button onClick={downloadQR} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
