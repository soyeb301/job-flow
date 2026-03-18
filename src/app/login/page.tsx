"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("Already logged in, redirecting to dashboard...");
      window.location.href = "/dashboard";
    }
  }, [status, session]);

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-600 dark:text-zinc-400">Checking session...</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      console.log("Attempting login...", { username });

      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      console.log("Login result:", JSON.stringify(result, null, 2));

      if (result?.error) {
        setError(`Login failed: ${result.error}`);
        setLoading(false);
      } else if (result?.ok) {
        console.log("Login successful! Redirecting now...");
        // Force redirect to dashboard immediately
        window.location.replace("/dashboard");
      } else {
        setError("Login returned no result. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(`Error: ${err.message || "Unknown error"}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                name="username"
                type="text"
                required
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                name="password"
                type="password"
                required
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
