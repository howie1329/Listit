import { AppMainSidebar } from "@/components/features/layout/AppMainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSettingsProvider } from "@/providers/UserSettingsProvider";
import { KeyboardNavigationProvider } from "@/hooks/use-keyboard-navigation";
import { Toaster } from "sonner";

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
