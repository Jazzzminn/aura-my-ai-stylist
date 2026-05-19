import { useAura } from "@/components/aura/store";
import { GarmentVisual } from "@/components/aura/Garment";
import { MOCK_NEW_ITEMS } from "@/lib/aura";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WardrobeTab() {
  const { wardrobe, addGarment } = useAura();
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<typeof MOCK_NEW_ITEMS[number] | null>(null);
  const [drawer1Open, setDrawer1Open] = useState(true);
  const [drawer2Open, setDrawer2Open] = useState(false);

  const tops = wardrobe.filter((g) => g.category === "top");
  const bottoms = wardrobe.filter((g) => g.category === "bottom");
  const longs = wardrobe.filter((g) => g.category === "dress" || g.category === "outerwear");
  const acc = wardrobe.filter((g) => g.category === "accessory" || g.category === "shoes");

  function handleOpenAdd() {
    setPreview(null);
    setProcessing(true);
    setOpen(true);
    setTimeout(() => {
      const used = new Set(wardrobe.map((g) => g.id));
      const next = MOCK_NEW_ITEMS.find((m) => !used.has(m.id)) ?? {
        ...MOCK_NEW_ITEMS[0],
        id: `n-${Date.now()}`,
      };
      setPreview(next);
      setProcessing(false);
    }, 2000);
  }

  function confirmAdd() {
    if (!preview) return;
    addGarment({ ...preview, id: `${preview.id}-${Date.now()}` });
    toast.success(`${preview.name} added to your wardrobe`);
    setOpen(false);
  }

  return (
    <div className="relative pb-28">
      <header className="px-5 pt-8 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your closet</p>
        <h1 className="mt-1 text-4xl text-foreground">Wardrobe</h1>
      </header>

      <div className="grid grid-cols-3 gap-3 px-5">
        {/* Hanging rail — tops */}
        <section className="col-span-2 rounded-2xl bg-card p-4 soft-shadow">
          <RailLabel>Hanging rail</RailLabel>
          <HangingRail items={tops.slice(0, 3)} />
        </section>

        {/* Tall hanging — dresses/coats */}
        <section className="rounded-2xl bg-card p-3 soft-shadow">
          <RailLabel>Long</RailLabel>
          <div className="relative mt-2 flex h-56 flex-col items-center gap-2 overflow-hidden">
            <div className="absolute top-2 left-3 right-3 h-px bg-foreground/20" />
            {longs.slice(0, 2).map((g) => (
              <HangingItem key={g.id} g={g} tall />
            ))}
          </div>
        </section>
      </div>

      {/* Drawers — bottoms */}
      <div className="mt-4 px-5 space-y-3">
        <Drawer
          label="Drawer · Bottoms"
          open={drawer1Open}
          onOpenChange={setDrawer1Open}
          items={bottoms.slice(0, 4)}
        />
        <Drawer
          label="Drawer · Bottoms II"
          open={drawer2Open}
          onOpenChange={setDrawer2Open}
          items={bottoms.slice(4)}
        />
      </div>

      {/* Accessories */}
      <div className="mt-4 px-5">
        <section className="rounded-2xl bg-card p-4 soft-shadow">
          <RailLabel>Accessories & shoes</RailLabel>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {acc.map((g) => (
              <div key={g.id} className="flex flex-col items-center">
                <div className="aspect-square w-full rounded-xl bg-secondary/50 p-2">
                  <GarmentVisual garment={g} size="sm" className="!h-full !w-full" />
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground truncate w-full text-center">
                  {g.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating add */}
      <button
        onClick={handleOpenAdd}
        aria-label="Add garment"
        className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground soft-shadow-lg hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" strokeWidth={1.75} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {processing ? "Processing your garment…" : "Ready to hang"}
            </DialogTitle>
            <DialogDescription>
              {processing
                ? "We're cleaning the background and detecting fabric."
                : "We pulled the details. Add it to your closet?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-56 items-center justify-center">
            {processing ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.25} />
            ) : preview ? (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-2xl bg-secondary/50 p-4">
                  <GarmentVisual garment={preview} size="lg" />
                </div>
                <p className="serif text-xl">{preview.name}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {preview.category}
                </p>
              </div>
            ) : null}
          </div>
          {!processing && preview && (
            <Button onClick={confirmAdd} className="rounded-full bg-primary text-primary-foreground">
              Add to wardrobe
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{children}</p>
  );
}

function HangingRail({ items }: { items: ReturnType<typeof Object> }) {
  return (
    <div className="relative mt-2 h-40">
      <div className="absolute left-2 right-2 top-2 h-px bg-foreground/25" />
      <div className="flex h-full items-start justify-around pt-1">
        {items.map((g: any) => (
          <HangingItem key={g.id} g={g} />
        ))}
      </div>
    </div>
  );
}

function HangingItem({ g, tall }: { g: any; tall?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full border border-foreground/40" />
      <div className="h-2 w-px bg-foreground/30" />
      <div className={tall ? "h-32 w-14" : "h-28 w-16"}>
        <GarmentVisual garment={g} className="!h-full !w-full" />
      </div>
    </div>
  );
}

function Drawer({
  label,
  items,
  open,
  onOpenChange,
}: {
  label: string;
  items: any[];
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="rounded-2xl bg-card soft-shadow">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3">
        <RailLabel>{label}</RailLabel>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex gap-3 overflow-x-auto px-4 pb-4">
          {items.length === 0 && (
            <div className="py-4 text-xs text-muted-foreground">Empty drawer</div>
          )}
          {items.map((g) => (
            <div
              key={g.id}
              className="flex min-w-[88px] flex-col items-center rounded-xl bg-secondary/50 p-2"
            >
              <GarmentVisual garment={g} size="sm" />
              <span className="mt-1 text-[10px] text-muted-foreground truncate w-full text-center">
                {g.name}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
