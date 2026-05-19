import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import auraLogo from "@/assets/aura-logo.png";

export const Route = createFileRoute("/")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim() || "you@aura.style";
    navigate({ to: "/app", search: { email: trimmed } });
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
          <Button
            type="submit"
            className="w-full rounded-full bg-primary py-6 text-base text-primary-foreground hover:opacity-90"
          >
            Continue
          </Button>
        </form>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          By continuing you agree to our calm, opt-in approach to styling.
        </p>
      </div>
    </main>
  );
}
