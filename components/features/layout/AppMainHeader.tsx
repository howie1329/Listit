"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export const AppMainHeader = () => {
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  return (
    <header className="sticky top-0 z-50 w-full h-8 flex items-center justify-between p-4 border-b">
      {userSettings && userSettings.name && (
        <p>{userSettings.name}&apos;s ListIt</p>
      )}
    </header>
  );
};
