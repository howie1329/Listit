"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AuthComponents = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signIn" | "signUp">("signIn");
  const router = useRouter();
  const { signIn } = useAuthActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    void signIn("password", { email, password, flow: activeTab })
      .then(() => {
        router.push("/item");
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "signIn" | "signUp");
    setError("");
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center p-8">
      <div className="w-full max-w-sm">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signIn">Sign In</TabsTrigger>
            <TabsTrigger value="signUp">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signIn" className="mt-0">
            <AuthForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              loading={loading}
              flow="signIn"
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="signUp" className="mt-0">
            <AuthForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              loading={loading}
              flow="signUp"
              onSubmit={handleSubmit}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  loading: boolean;
  flow: "signIn" | "signUp";
  onSubmit: (e: React.FormEvent) => void;
}

const AuthForm = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  flow,
  onSubmit,
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {flow === "signIn" ? "Sign in" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {flow === "signIn"
              ? "Sign in to your account to continue"
              : "Create a new account to get started"}
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="h-11"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="h-11"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" disabled={loading} className="h-11">
            {loading
              ? flow === "signIn"
                ? "Signing in..."
                : "Creating account..."
              : flow === "signIn"
                ? "Sign in"
                : "Create account"}
          </Button>

          {flow === "signIn" && (
            <div className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                disabled={loading}
                className="hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
