import { useAura } from "@/components/aura/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


export function SettingsTab() {
  const { user, setUser, aiEnabled, setAiEnabled } = useAura();
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="pb-28">
      <header className="px-5 pt-8 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account</p>
        <h1 className="mt-1 text-4xl text-foreground">Settings</h1>
      </header>

      <div className="space-y-4 px-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">
            Name
          </Label>
          <Input
            id="name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="rounded-xl border-border bg-card py-6"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="rounded-xl border-border bg-card py-6"
          />
        </div>

        <div className="mt-6 rounded-2xl bg-card p-4 soft-shadow">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
              <Sparkles className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="serif text-lg">AI suggestions</p>
                <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Opt-in. We'll only suggest looks when you ask. You're always in control.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 flex justify-center px-5">
        <button
          onClick={logout}
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
