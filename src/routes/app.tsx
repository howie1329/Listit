import { createFileRoute, Link, Navigate } from "@tanstack/react-router"
import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from "convex/react"

import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"

export const Route = createFileRoute("/app")({
  component: AppHome,
})

function AppHome() {
  const { signOut } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isReaderOpen, setIsReaderOpen] = useState(true)

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/signin" />
  }

  const sidebarItems = ["Bookmarks", "Collections", "Notes", "Settings"]

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-border/50 bg-background">
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              Menu
            </Button>
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Listit Workspace
            </p>
          </div>

          <div className="hidden w-full max-w-md items-center md:flex">
            <Input placeholder="Search bookmarks (coming soon)" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            >
              {isSidebarCollapsed ? "Expand" : "Collapse"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReaderOpen((prev) => !prev)}
            >
              {isReaderOpen ? "Hide reader" : "Show reader"}
            </Button>
            <Button type="button" variant="outline" size="sm">
              Profile
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <aside
        className={[
          "fixed bottom-0 left-0 top-14 z-30 border-r border-border/50 bg-background transition-all duration-200",
          isSidebarCollapsed ? "w-14" : "w-60",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <nav className="flex h-full flex-col gap-2 p-2">
          {sidebarItems.map((item) => (
            <Button
              key={item}
              type="button"
              variant="ghost"
              size="sm"
              className={isSidebarCollapsed ? "justify-center px-2" : "justify-start"}
            >
              {isSidebarCollapsed ? item.charAt(0) : item}
            </Button>
          ))}
        </nav>
      </aside>

      {isMobileNavOpen ? (
        <button
          type="button"
          aria-label="Close mobile navigation"
          className="fixed inset-0 top-14 z-20 bg-background/70 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      ) : null}

      <main
        className={[
          "flex min-h-dvh pt-14 transition-all duration-200",
          isSidebarCollapsed ? "md:pl-14" : "md:pl-60",
        ].join(" ")}
      >
        <section className="flex-1 min-w-0 p-4 sm:p-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Bookmarks
              </p>
              <h1 className="mt-1 text-xl font-semibold leading-tight">Saved items</h1>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/">Back to landing</Link>
            </Button>
          </div>

          <div className="mt-4 rounded-md border border-border/50 p-4">
            <p className="text-sm text-muted-foreground">
              This is the `/app` shell home. Bookmarks content, filters, and search results will
              render here next.
            </p>
          </div>
        </section>

        {isReaderOpen ? (
          <aside className="hidden w-88 shrink-0 border-l border-border/50 p-4 lg:block">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Reader and notes
            </p>
            <h2 className="mt-1 text-base font-semibold">Preview panel</h2>
            <p className="mt-3 text-xs leading-snug text-muted-foreground">
              This optional panel is reserved for bookmark reader content and editable notes.
            </p>
          </aside>
        ) : null}
      </main>
    </div>
  )
}

