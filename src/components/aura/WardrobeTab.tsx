import { useAura } from "@/components/aura/store";
import { GarmentVisual } from "@/components/aura/Garment";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import type { Garment } from "@/lib/aura";

export function WardrobeTab() {
  const { wardrobe, openAddItem, removeGarment } = useAura();
  const [drawer1Open, setDrawer1Open] = useState(true);
  const [drawer2Open, setDrawer2Open] = useState(false);

  const tops = wardrobe.filter((g) => g.category === "top");
  const bottoms = wardrobe.filter((g) => g.category === "bottom");
  const longs = wardrobe.filter((g) => g.category === "dress" || g.category === "outerwear");
  const acc = wardrobe.filter((g) => g.category === "accessory" || g.category === "shoes");

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
          <HangingRail items={tops.slice(0, 3)} onRemove={removeGarment} />
        </section>

        {/* Tall hanging — dresses/coats */}
        <section className="rounded-2xl bg-card p-3 soft-shadow">
          <RailLabel>Long</RailLabel>
          <div className="relative mt-2 flex h-56 flex-col items-center gap-2 overflow-hidden">
            <div className="absolute top-2 left-3 right-3 h-px bg-foreground/20" />
            {longs.slice(0, 2).map((g) => (
              <HangingItem key={g.id} g={g} tall onRemove={removeGarment} />
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
          onRemove={removeGarment}
        />
        <Drawer
          label="Drawer · Bottoms II"
          open={drawer2Open}
          onOpenChange={setDrawer2Open}
          items={bottoms.slice(4)}
          onRemove={removeGarment}
        />
      </div>

      {/* Accessories */}
      <div className="mt-4 px-5">
        <section className="rounded-2xl bg-card p-4 soft-shadow">
          <RailLabel>Accessories & shoes</RailLabel>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {acc.map((g) => (
              <div key={g.id} className="flex flex-col items-center">
                <div className="relative aspect-square w-full rounded-xl bg-secondary/50 p-2">
                  <GarmentVisual garment={g} size="sm" className="!h-full !w-full" />
                  <DeleteBadge onClick={() => removeGarment(g.id)} />
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
        onClick={openAddItem}
        aria-label="Add garment"
        className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground soft-shadow-lg hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" strokeWidth={1.75} />
      </button>
    </div>
  );
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{children}</p>
  );
}

function DeleteBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Remove item"
      className="absolute -top-1.5 -right-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-foreground/80 text-background shadow-sm opacity-80 hover:opacity-100"
    >
      <X className="h-3 w-3" strokeWidth={2} />
    </button>
  );
}

function HangingRail({ items, onRemove }: { items: Garment[]; onRemove: (id: string) => void }) {
  return (
    <div className="relative mt-2 h-40">
      <div className="absolute left-2 right-2 top-2 h-px bg-foreground/25" />
      <div className="flex h-full items-start justify-around pt-1">
        {items.map((g) => (
          <HangingItem key={g.id} g={g} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

function HangingItem({ g, tall, onRemove }: { g: Garment; tall?: boolean; onRemove?: (id: string) => void }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="h-3 w-3 rounded-full border border-foreground/40" />
      <div className="h-2 w-px bg-foreground/30" />
      <div className={`relative ${tall ? "h-32 w-14" : "h-28 w-16"}`}>
        <GarmentVisual garment={g} className="!h-full !w-full" />
        {onRemove && <DeleteBadge onClick={() => onRemove(g.id)} />}
      </div>
    </div>
  );
}

function Drawer({
  label,
  items,
  open,
  onOpenChange,
  onRemove,
}: {
  label: string;
  items: Garment[];
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onRemove: (id: string) => void;
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
              className="relative flex min-w-[88px] flex-col items-center rounded-xl bg-secondary/50 p-2"
            >
              <GarmentVisual garment={g} size="sm" />
              <span className="mt-1 text-[10px] text-muted-foreground truncate w-full text-center">
                {g.name}
              </span>
              <DeleteBadge onClick={() => onRemove(g.id)} />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
