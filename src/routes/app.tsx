import { createFileRoute, Link, Navigate } from "@tanstack/react-router"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from "convex/react"

import { Button } from "#/components/ui/button"

export const Route = createFileRoute("/app")({
  component: AppHome,
})

function AppHome() {
  const { signOut } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/signin" />
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <h1 className="mt-2 text-xl font-semibold leading-tight">Welcome to Listit</h1>
          <p className="mt-2 text-xs leading-snug text-muted-foreground">
            You are signed in. Continue to your next authenticated routes from here.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
      <div className="mx-auto mt-6 w-full max-w-3xl">
        <Button asChild size="sm">
          <Link to="/">Back to landing page</Link>
        </Button>
      </div>
    </main>
  )
}
