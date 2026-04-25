import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router"
import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from "convex/react"

import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { TooltipProvider } from "#/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "#/components/ui/sidebar"

export const Route = createFileRoute("/app")({
  component: AppHome,
})

function AppHome() {
  const { signOut } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [isReaderOpen, setIsReaderOpen] = useState(true)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/signin" />
  }

  const sidebarItems = [
    { label: "Bookmarks", to: "/app/bookmarks" as const },
    { label: "Collections", to: "/app/collections" as const },
    { label: "Notes", to: "/app/notes" as const },
    { label: "Settings", to: "/app/settings" as const },
  ]

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-dvh bg-background text-foreground">
          <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-border/50 bg-background">
            <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-1">
                <SidebarTrigger className="shrink-0" />
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Listit Workspace
                </p>
              </div>

              <div className="hidden w-full max-w-md items-center md:flex">
                <Input
                  aria-label="Global search placeholder"
                  placeholder="Search bookmarks (coming soon)"
                />
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReaderOpen((prev) => !prev)}
                >
                  {isReaderOpen ? "Hide panel" : "Show panel"}
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

          <div className="flex min-h-dvh pt-14">
            <Sidebar
              className="top-14 h-[calc(100svh-3.5rem)] border-r border-sidebar-border/80"
              collapsible="icon"
            >
              <SidebarHeader className="gap-1 border-b border-sidebar-border/70 p-2">
                <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/70">
                  Navigation
                </p>
              </SidebarHeader>

              <SidebarContent className="p-1">
                <SidebarGroup className="px-1 py-1">
                  <SidebarMenu>
                    {sidebarItems.map((item) => (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          size="sm"
                          tooltip={item.label}
                          isActive={pathname === item.to}
                          className="h-7 rounded-full"
                        >
                          <Link to={item.to} aria-label={item.label}>
                            <span className="inline-flex size-4 items-center justify-center rounded-sm text-[10px] font-medium">
                              {item.label.charAt(0)}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <SidebarInset className="min-w-0">
              <div className="flex min-h-[calc(100dvh-3.5rem)]">
                <section className="min-w-0 flex-1 p-4 sm:p-6">
                  <div className="flex items-center justify-end border-b border-border/50 pb-3">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/">Back to landing</Link>
                    </Button>
                  </div>

                  <div className="py-4">
                    <Outlet />
                  </div>
                </section>

                {isReaderOpen ? (
                  <aside className="hidden w-88 shrink-0 border-l border-border/50 p-4 lg:block">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Reader and notes
                    </p>
                    <h2 className="mt-1 text-base font-semibold leading-tight">Preview panel</h2>
                    <p className="mt-3 text-xs leading-snug text-muted-foreground">
                      This optional panel is reserved for bookmark reader content and editable
                      notes.
                    </p>
                  </aside>
                ) : null}
              </div>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

