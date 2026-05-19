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

// Tile dimensions — sized so the delete badge stays inside the scroll row.
const TILE_W = 160;
const TILE_H = 210;
const TALL_H = 280;
const ACC_W = 160;
const ACC_H = 200;

export function WardrobeTab() {
  const { wardrobe, openAddItem, removeGarment, renameGarment } = useAura();
  const [drawer1Open, setDrawer1Open] = useState(true);

  const tops = wardrobe.filter((g) => g.category === "top");
  const bottoms = wardrobe.filter((g) => g.category === "bottom");
  const longs = wardrobe.filter((g) => g.category === "dress" || g.category === "outerwear");
  const acc = wardrobe.filter((g) => g.category === "accessory" || g.category === "shoes");

  return (
    <div className="relative pb-28">
      <style>{`
        .wardrobe-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <header className="px-5 pt-8 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your closet</p>
        <h1 className="mt-1 text-4xl text-foreground">Wardrobe</h1>
      </header>

      <div className="grid grid-cols-3 gap-3 px-5">
        {/* Hanging rail — tops */}
        <section className="col-span-2 rounded-2xl bg-card p-4 soft-shadow">
          <RailLabel>Hanging rail</RailLabel>
          <HangingRail items={tops} onRemove={removeGarment} onRename={renameGarment} />
        </section>

        {/* Tall hanging — dresses/coats */}
        <section className="rounded-2xl bg-card p-3 soft-shadow">
          <RailLabel>Long</RailLabel>
          <ScrollRow>
            <div className="relative flex flex-nowrap items-start gap-3 pt-1">
              <div className="absolute left-0 right-0 top-2 h-px bg-foreground/20" />
              {longs.map((g) => (
                <HangingItem key={g.id} g={g} tall onRemove={removeGarment} onRename={renameGarment} />
              ))}
            </div>
          </ScrollRow>
        </section>
      </div>

      {/* Drawers — bottoms */}
      <div className="mt-4 px-5 space-y-3">
        <Drawer
          label="Drawer · Bottoms"
          open={drawer1Open}
          onOpenChange={setDrawer1Open}
          items={bottoms}
          onRemove={removeGarment}
          onRename={renameGarment}
        />
      </div>

      {/* Accessories */}
      <div className="mt-4 px-5">
        <section className="rounded-2xl bg-card p-4 soft-shadow">
          <RailLabel>Accessories &amp; shoes</RailLabel>
          <ScrollRow className="mt-3">
            <div className="grid grid-flow-col gap-3" style={{ gridAutoColumns: `minmax(${ACC_W}px, ${ACC_W}px)` }}>
              {acc.map((g) => (
                <div key={g.id} className="flex flex-col items-center">
                  <div className="relative w-full" style={{ height: ACC_H }}>
                    <GarmentVisual
                      garment={g}
                      className="!h-full !w-full"
                      editableName
                      onRename={(n) => renameGarment(g.id, n)}
                    />
                    <DeleteBadge onClick={() => removeGarment(g.id)} />
                  </div>
                </div>
              ))}
            </div>
          </ScrollRow>
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

/**
 * Horizontal scroll container with a right-edge fade overlay that stays
 * pinned to the viewport (not the scrolled content) — fixes the visual
 * glitch where the gradient slid with the content while swiping.
 */
function ScrollRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="overflow-x-auto wardrobe-scroll pt-2 -mt-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
        style={{ background: "linear-gradient(to right, transparent, oklch(0.984 0.01 80))" }}
      />
    </div>
  );
}

function HangingRail({
  items,
  onRemove,
  onRename,
}: {
  items: Garment[];
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  return (
    <ScrollRow className="mt-2">
      <div className="relative flex flex-nowrap items-start gap-3 pt-1">
        <div className="absolute left-0 right-0 top-2 h-px bg-foreground/25" />
        {items.map((g) => (
          <HangingItem key={g.id} g={g} onRemove={onRemove} onRename={onRename} />
        ))}
      </div>
    </ScrollRow>
  );
}

function HangingItem({
  g,
  tall,
  onRemove,
  onRename,
}: {
  g: Garment;
  tall?: boolean;
  onRemove?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
}) {
  return (
    <div className="relative flex flex-shrink-0 flex-col items-center">
      <div className="h-3 w-3 rounded-full border border-foreground/40" />
      <div className="h-2 w-px bg-foreground/30" />
      <div className="relative flex-shrink-0" style={{ width: TILE_W, height: tall ? TALL_H : TILE_H }}>
        <GarmentVisual
          garment={g}
          className="!h-full !w-full"
          editableName
          onRename={onRename ? (n) => onRename(g.id, n) : undefined}
        />
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
  onRename,
}: {
  label: string;
  items: Garment[];
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
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
        <div className="relative px-4 pb-4">
          <div
            className="overflow-x-auto wardrobe-scroll"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex gap-3">
              {items.length === 0 && (
                <div className="py-4 text-xs text-muted-foreground">Empty drawer</div>
              )}
              {items.map((g) => (
                <div
                  key={g.id}
                  className="relative flex-shrink-0"
                  style={{ width: TILE_W, height: TILE_H }}
                >
                  <GarmentVisual
                    garment={g}
                    className="!h-full !w-full"
                    editableName
                    onRename={(n) => onRename(g.id, n)}
                  />
                  <DeleteBadge onClick={() => onRemove(g.id)} />
                </div>
              ))}
            </div>
          </div>
          <div
            className="pointer-events-none absolute right-4 top-0 bottom-4 w-8 z-10"
            style={{ background: "linear-gradient(to right, transparent, oklch(0.984 0.01 80))" }}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
