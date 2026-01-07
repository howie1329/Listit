import { AppMainSidebar } from "@/components/features/layout/AppMainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSettingsProvider } from "@/providers/UserSettingsProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingsProvider>
      <div className="bg-background w-svw h-svh overflow-hidden">
        <SidebarProvider>
          <main className="flex flex-row w-svw h-svh overflow-hidden">
            <AppMainSidebar />
            {children}
          </main>
        </SidebarProvider>
      </div>
    </UserSettingsProvider>
  );
}
