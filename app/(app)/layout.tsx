"use client";
import { CreateListModel } from "@/components/features/list/CreateListModal";
import { api } from "@/convex/_generated/api";
import { UserSettingsProvider } from "@/providers/UserSettingsProvider";
import { useQuery } from "convex/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingsProvider>
      <div className="bg-background w-full h-full overflow-hidden">
        <AppHeader />
        <main className="w-full h-[calc(100vh-2rem)] overflow-hidden">
          {children}
        </main>
      </div>
    </UserSettingsProvider>
  );
}

const AppHeader = () => {
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  return (
    <header className="sticky top-0 z-50 w-full h-8 flex items-center justify-between p-4 border-b">
      {userSettings && userSettings.name && (
        <p>{userSettings.name}&apos;s ListIt</p>
      )}
      <CreateListModel />
    </header>
  );
};
