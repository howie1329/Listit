import { Link } from '@tanstack/react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'
import { APP_NAV_ITEMS } from '#/features/app-shell/config/navigation'

type AppSidebarProps = {
  pathname: string
}

export function AppSidebar({ pathname }: AppSidebarProps) {
  return (
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
            {APP_NAV_ITEMS.map((item) => (
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
  )
}
