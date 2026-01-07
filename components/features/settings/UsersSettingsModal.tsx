"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";
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

export const UserSettingsModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
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
    <Dialog open={open} onOpenChange={setOpen}>
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
