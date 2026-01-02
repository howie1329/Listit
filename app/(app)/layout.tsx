"use client";
import { CreateListModel } from "@/components/features/list/CreateListModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { UserSettingsProvider } from "@/providers/UserSettingsProvider";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

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
      <div className="flex flex-row">
        <CreateListModel />
        <UserSettingsModal />
      </div>
    </header>
  );
};

const UserSettingsModal = () => {
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const [name, setName] = useState(userSettings?.name || "");
  const [theme, setTheme] = useState(userSettings?.theme || "dark");
  const [defaultModel, setDefaultModel] = useState(
    userSettings?.defaultModel || "gpt-4o",
  );
  const [isAiEnabled, setIsAiEnabled] = useState(
    userSettings?.isAiEnabled || false,
  );
  const updateUserSettings = useMutation(api.userFunctions.updateUserSettings);
  const handleSave = () => {
    updateUserSettings({
      name,
      theme,
      defaultModel,
      isAiEnabled,
    });
  };
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <HugeiconsIcon icon={Settings01Icon} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex flex-row gap-2">
          <Label>Display Mode</Label>
          <Select
            value={theme}
            onValueChange={(value) => setTheme(value as "light" | "dark")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a display mode" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row gap-2">
          <Label>Default AI Model</Label>
          <Select
            value={defaultModel}
            onValueChange={(value) =>
              setDefaultModel(value as "gpt-4o" | "gpt-4o-mini")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row gap-2">
          <Label>AI Enabled?</Label>
          <Switch
            checked={isAiEnabled}
            onCheckedChange={() => setIsAiEnabled(!isAiEnabled)}
          />
        </div>
        <Button onClick={handleSave}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};
