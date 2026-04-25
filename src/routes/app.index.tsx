import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/")({
  component: AppIndexPage,
})

function AppIndexPage() {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Workspace
      </p>
      <h1 className="mt-1 text-xl font-semibold leading-tight">App home</h1>
      <p className="mt-3 text-xs leading-snug text-muted-foreground">
        Choose a section from the sidebar.
      </p>
    </div>
  )
}
