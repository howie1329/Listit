import {
  createFileRoute,
  Link,
  Navigate,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'

import { Button } from '#/components/ui/button'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { TooltipProvider } from '#/components/ui/tooltip'
import { AppHeader } from '#/features/app-shell/components/app-header'
import { AppSidebar } from '#/features/app-shell/components/app-sidebar'
import { ReaderPanel } from '#/features/app-shell/components/reader-panel'
import { useReaderPanelState } from '#/features/app-shell/hooks/use-reader-panel-state'

export const Route = createFileRoute('/app')({
  component: AppHome,
})

function AppHome() {
  const { signOut } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { isReaderOpen, toggleReaderPanel } = useReaderPanelState(true)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/signin" />
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-dvh bg-background text-foreground">
          <AppHeader
            isReaderOpen={isReaderOpen}
            onToggleReaderPanel={toggleReaderPanel}
            onSignOut={() => signOut()}
          />

          <div className="flex min-h-dvh pt-14">
            <AppSidebar pathname={pathname} />

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

                {isReaderOpen ? <ReaderPanel /> : null}
              </div>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
