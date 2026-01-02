"use client";
import { createContext, useContext, useEffect } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";

export const UserSettingsContext = createContext<Doc<"userSettings"> | null>(
  null,
);

export const UserSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const pathname = usePathname();
  const createUserSettingsMutation = useMutation(
    api.userFunctions.createUserSettings,
  );
  useEffect(() => {
    if (userSettings === undefined || pathname === "/onboarding") return;
    if (!userSettings || !userSettings.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [userSettings, router, pathname, createUserSettingsMutation]);
  return (
    <UserSettingsContext.Provider value={userSettings ?? null}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error(
      "useUserSettings must be used within a UserSettingsProvider",
    );
  }
  return context;
};
