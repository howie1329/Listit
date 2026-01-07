import { AppMainSidebar } from "@/components/features/layout/AppMainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSettingsProvider } from "@/providers/UserSettingsProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingsProvider>
      <div className="bg-background w-full h-full overflow-hidden">
        <SidebarProvider>
          <main className="flex flex-row w-full h-[calc(100vh-2rem)] overflow-hidden">
            <AppMainSidebar />
            {children}
          </main>
        </SidebarProvider>
      </div>
    </UserSettingsProvider>
  );
}
