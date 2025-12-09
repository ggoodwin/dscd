import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SettingsContent } from "@/components/dashboard/settings-content"

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <SettingsContent />
        </div>
      </main>
    </div>
  )
}
