import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuraProvider } from "@/components/aura/store";
import { AddItemModal } from "@/components/aura/AddItemModal";
import { WardrobeTab } from "@/components/aura/WardrobeTab";
import { StylerTab } from "@/components/aura/StylerTab";
import { AIStyleTab } from "@/components/aura/AIStyleTab";
import { OutfitsTab } from "@/components/aura/OutfitsTab";
import { SettingsTab } from "@/components/aura/SettingsTab";
import { Shirt, Sparkles, Images, Settings, User } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ email: z.string().optional() });

export const Route = createFileRoute("/app")({
  validateSearch: searchSchema,
  component: AppShell,
});

type TabKey = "wardrobe" | "styler" | "ai" | "outfits" | "settings";

function AppShell() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("wardrobe");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/" });
      } else {
        setChecked(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (!checked) return null;

  return (
    <AuraProvider initialEmail={email}>
      <div className="min-h-dvh bg-background">
        <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl px-0 sm:px-4 md:px-6 lg:px-8">
          {tab === "wardrobe" && <WardrobeTab />}
          {tab === "styler" && <StylerTab />}
          {tab === "ai" && <AIStyleTab />}
          {tab === "outfits" && <OutfitsTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
        <BottomTabs active={tab} onChange={setTab} />
        <AddItemModal />
      </div>
    </AuraProvider>
  );
}

function BottomTabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const items: { key: TabKey; label: string; Icon: any }[] = [
    { key: "wardrobe", label: "Wardrobe", Icon: Shirt },
    { key: "styler", label: "Styler", Icon: User },
    { key: "ai", label: "AI Style", Icon: Sparkles },
    { key: "outfits", label: "Outfits", Icon: Images },
    { key: "settings", label: "Settings", Icon: Settings },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl items-stretch justify-between px-2 py-2">
        {items.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={1.5}
              />
              <span
                className={`text-[10px] ${isActive ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
