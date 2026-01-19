import { AppMainSidebar } from "@/components/features/layout/AppMainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSettingsProvider } from "@/providers/UserSettingsProvider";
import { KeyboardNavigationProvider } from "@/hooks/use-keyboard-navigation";
import { Toaster } from "sonner";

/**
 * Composes application-level providers and renders the main app layout with a sidebar and toast container.
 *
 * Wraps content with user settings, keyboard navigation, and sidebar providers, and renders the app's main container including the primary sidebar and a Toaster for notifications.
 *
 * @param children - Page content to render inside the main application layout
 * @returns The React element tree for the application's top-level layout
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingsProvider>
      <KeyboardNavigationProvider>
        <div className="bg-background w-svw h-svh overflow-hidden">
          <SidebarProvider>
            <main className="flex flex-row w-svw h-svh overflow-hidden">
              <AppMainSidebar />
              {children}
              <Toaster />
            </main>
          </SidebarProvider>
        </div>
      </KeyboardNavigationProvider>
    </UserSettingsProvider>
  );
}