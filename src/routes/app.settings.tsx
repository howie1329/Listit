import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Settings
      </p>
      <h1 className="mt-1 text-xl font-semibold leading-tight">Settings</h1>
      <p className="mt-3 text-xs leading-snug text-muted-foreground">Empty page.</p>
    </div>
  )
}
