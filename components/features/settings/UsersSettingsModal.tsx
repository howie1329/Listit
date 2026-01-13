"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DefaultModel } from "@/convex/lib/modelMapping";

export const UserSettingsModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [defaultModel, setDefaultModel] = useState<DefaultModel>("gpt-4o");
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const updateUserSettings = useMutation(api.userFunctions.updateUserSettings);

  const handleSave = () => {
    updateUserSettings({
      name,
      email,
      defaultModel,
      isAiEnabled,
    })
      .then(() => {
        setOpen(false);
        toast.success("User settings updated successfully");
      })
      .catch((error) => {
        toast.error("Failed to update user settings");
        console.error("Failed to update user settings:", error);
      });
  };

  const handleSignOut = () => {
    void signOut();
    setOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const changeState = () => {
      if (!userSettings) return;
      setName(userSettings.name);
      setEmail(userSettings.email ?? "");
      setDefaultModel(userSettings.defaultModel as DefaultModel);
      setIsAiEnabled(userSettings.isAiEnabled);
    };
    if (open) {
      changeState();
    }
  }, [open, userSettings]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-2">
          <Label>Default AI Model</Label>
          <Select
            value={defaultModel}
            onValueChange={(value) => setDefaultModel(value as DefaultModel)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              <SelectItem value="openai/gpt-oss-20b:free">
                GPT-OSS-20B (Free)
              </SelectItem>
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
        <div className="flex flex-row gap-2">
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
