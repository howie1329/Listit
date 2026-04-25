import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/collections")({
  component: CollectionsPage,
})

function CollectionsPage() {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Collections
      </p>
      <h1 className="mt-1 text-xl font-semibold leading-tight">Collections</h1>
      <p className="mt-3 text-xs leading-snug text-muted-foreground">Empty page.</p>
    </div>
  )
}
