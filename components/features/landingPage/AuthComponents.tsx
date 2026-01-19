"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const AuthComponents = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const router = useRouter();
  const { signIn } = useAuthActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    void signIn("password", { email, password, flow })
      .then(() => {
        router.push("/list");
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleFlow = () => {
    setFlow(flow === "signIn" ? "signUp" : "signIn");
    setError("");
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center p-8">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {flow === "signIn" ? "Sign in" : "Create account"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {flow === "signIn"
                  ? "Sign in to your account to continue"
                  : "Create a new account to get started"}
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md p-3">
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

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  onClick={toggleFlow}
                  disabled={loading}
                  className="hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-2 transition-colors"
                >
                  {flow === "signIn"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
