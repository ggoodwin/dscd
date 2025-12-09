"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinksList } from "@/components/dashboard/links-list"
import { CreateLinkForm } from "@/components/dashboard/create-link-form"
import { Users, Link2, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"server" | "profile">("server")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Links</h1>
          <p className="text-muted-foreground">Manage your Discord shortlinks</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Shortlink</DialogTitle>
                <DialogDescription>Create a shortlink for a Discord server or profile.</DialogDescription>
              </DialogHeader>
              <CreateLinkForm defaultType={activeTab} onSuccess={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "server" | "profile")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="server" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Server Links
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Profile Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="server" className="mt-6">
          <LinksList linkType="server" />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <LinksList linkType="profile" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
