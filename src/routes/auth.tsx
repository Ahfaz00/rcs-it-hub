import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Sign In | R Computer Solutions" },
      { name: "description", content: "Sign in to the R Computer Solutions website admin panel." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Staff Sign In | R Computer Solutions" },
      { property: "og:description", content: "Admin access for R Computer Solutions staff." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin" });
  }

  async function onReset() {
    if (!email.trim()) {
      toast.error("Enter your email first, then click reset.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6 shadow-card"
        >
          <div>
            <h1 className="font-display text-lg font-bold">Staff sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin access for managing the website content.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
          <div className="flex justify-end text-xs text-muted-foreground">
            <button type="button" onClick={onReset} className="underline-offset-2 hover:underline">
              Forgot password?
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

