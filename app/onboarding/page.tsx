"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const createUserSettingsMutation = useMutation(
    api.userFunctions.createUserSettings,
  );
  const [name, setName] = useState("");
  const [defaultModel, setDefaultModel] = useState<"gpt-4o" | "gpt-4o-mini">(
    "gpt-4o",
  );
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const updateUserSettings = useMutation(api.userFunctions.updateUserSettings);
  const router = useRouter();
  const handleSave = () => {
    updateUserSettings({
      name,
      defaultModel,
      isAiEnabled,
    }).then(() => {
      router.push("/list");
    });
  };

  useEffect(() => {
    if (userSettings === null || userSettings === undefined) {
      void createUserSettingsMutation({
        name: "",
        defaultModel: defaultModel,
        isAiEnabled: isAiEnabled,
      });
    }
  }, [userSettings, createUserSettingsMutation]);
  return (
    <div className="flex flex-col w-full h-full border-black border-2 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome To List It</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex flex-row gap-2 items-center">
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
            <div className="flex flex-row gap-2 items-center">
              <Label>AI Enabled? (Use AI to generate lists and items)</Label>
              <Switch
                checked={isAiEnabled}
                onCheckedChange={() => setIsAiEnabled(!isAiEnabled)}
              />
            </div>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
