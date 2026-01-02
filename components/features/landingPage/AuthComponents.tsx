import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const AuthComponents = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const router = useRouter();
  const { signIn } = useAuthActions();

  const handleSignIn = () => {
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
  const toogleFlow = () => {
    setFlow(flow === "signIn" ? "signUp" : "signIn");
  };

  const SignInFlow = () => {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In To Your Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-row gap-2">
            <Button onClick={handleSignIn} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            <Button variant="outline" onClick={toogleFlow} disabled={loading}>
              Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SignUpFlow = () => {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up To Your Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-row gap-2">
            <Button onClick={handleSignIn} disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            <Button variant="outline" onClick={toogleFlow} disabled={loading}>
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center border-2 border-red-500">
      {flow === "signIn"
        ? SignInFlow()
        : flow === "signUp"
          ? SignUpFlow()
          : null}

      {error && (
        <Badge
          className="w-full text-center truncate text-sm line-clamp-1"
          variant="destructive"
        >
          {error}
        </Badge>
      )}
    </div>
  );
};
