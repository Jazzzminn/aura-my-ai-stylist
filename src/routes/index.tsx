import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ensureTestAccount } from "@/lib/seed.functions";

export const Route = createFileRoute("/")({
  component: Login,
});

type Mode = "signin" | "signup";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const seed = useServerFn(ensureTestAccount);

  // If a session already exists, jump straight to the app.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({
          to: "/app",
          search: { email: data.session.user.email ?? "" },
        });
      }
    });
  }, [navigate]);

  // Seed the demo test@test.com account on first visit (idempotent).
  useEffect(() => {
    seed().catch((err) => console.warn("seed failed", err));
  }, [seed]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) return;
    setBusy(true);
    try {
      const fn =
        mode === "signup"
          ? supabase.auth.signUp({
              email: trimmed,
              password,
              options: { emailRedirectTo: window.location.origin },
            })
          : supabase.auth.signInWithPassword({ email: trimmed, password });
      const { data, error } = await fn;
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        toast.success("Check your email to confirm your account.");
        return;
      }
      navigate({ to: "/app", search: { email: trimmed } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-8">
        <div className="flex w-full flex-col items-center">
          <h1 className="serif text-6xl tracking-tight text-foreground">Aura</h1>
          <div className="mt-3 h-px w-12 bg-primary/60" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Your wardrobe, multiplied.
          </p>
        </div>

        <form onSubmit={submit} className="mt-14 w-full space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@aura.style"
              className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-6 text-base text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="block w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Try the demo: <span className="font-mono">test@test.com</span> /{" "}
          <span className="font-mono">test1234</span>
        </p>
      </div>
    </main>
  );
}
