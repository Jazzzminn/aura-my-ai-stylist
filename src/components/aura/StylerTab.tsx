import { useMemo, useRef, useState } from "react";
import { useAura } from "@/components/aura/store";
import { GarmentVisual } from "@/components/aura/Garment";
import { Button } from "@/components/ui/button";
import { Shuffle, ChevronLeft, ChevronRight, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Garment } from "@/lib/aura";

type Slot = "top" | "bottom" | "shoes";

export function StylerTab() {
  const { wardrobe, addOutfit, openAddItem } = useAura();
  const tops = useMemo(() => wardrobe.filter((g) => g.category === "top"), [wardrobe]);
  const bottoms = useMemo(() => wardrobe.filter((g) => g.category === "bottom"), [wardrobe]);
  const shoes = useMemo(() => wardrobe.filter((g) => g.category === "shoes"), [wardrobe]);

  const [topIdx, setTopIdx] = useState(0);
  const [botIdx, setBotIdx] = useState(0);
  const [shoeIdx, setShoeIdx] = useState(0);

  const top = tops[topIdx % Math.max(tops.length, 1)];
  const bottom = bottoms[botIdx % Math.max(bottoms.length, 1)];
  const shoe = shoes[shoeIdx % Math.max(shoes.length, 1)];

  function cycle(slot: Slot, dir: 1 | -1) {
    if (slot === "top") setTopIdx((i) => (i + dir + tops.length) % tops.length);
    if (slot === "bottom") setBotIdx((i) => (i + dir + bottoms.length) % bottoms.length);
    if (slot === "shoes") setShoeIdx((i) => (i + dir + shoes.length) % shoes.length);
  }

  function shuffleAll() {
    setTopIdx(Math.floor(Math.random() * tops.length));
    setBotIdx(Math.floor(Math.random() * bottoms.length));
    setShoeIdx(Math.floor(Math.random() * shoes.length));
  }

  function save() {
    if (!top || !bottom || !shoe) return;
    addOutfit({
      id: `o-${Date.now()}`,
      name: `Look ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      topId: top.id,
      bottomId: bottom.id,
      shoesId: shoe.id,
    });
    toast.success("Outfit saved to your collection");
  }

  return (
    <div className="pb-28">
      <header className="flex items-start justify-between px-5 pt-8 pb-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today's look</p>
          <h1 className="mt-1 text-4xl text-foreground">Styler</h1>
        </div>
        <button
          onClick={shuffleAll}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground soft-shadow hover:bg-secondary"
        >
          <Shuffle className="h-3.5 w-3.5" strokeWidth={1.5} /> Shuffle all
        </button>
      </header>

      <p className="mx-5 mb-4 flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 text-[11px] text-muted-foreground w-fit">
        <Sparkles className="h-3 w-3" strokeWidth={1.5} /> AI is here when you want it
      </p>

      {/* Mannequin */}
      <div className="relative mx-auto mt-2 w-full max-w-sm px-5">
        <Mannequin
          top={top}
          bottom={bottom}
          shoe={shoe}
          topsEmpty={tops.length === 0}
          bottomsEmpty={bottoms.length === 0}
          shoesEmpty={shoes.length === 0}
          onSwipe={cycle}
          onAdd={openAddItem}
        />
      </div>

      {/* Indicators */}
      <div className="mt-6 grid grid-cols-3 gap-3 px-5">
        <Indicator label="Top" name={top?.name} />
        <Indicator label="Bottom" name={bottom?.name} />
        <Indicator label="Shoes" name={shoe?.name} />
      </div>

      <div className="mt-8 px-5">
        <Button
          onClick={save}
          className="w-full rounded-full bg-[var(--sage)] py-6 text-base text-foreground hover:opacity-90"
        >
          Save outfit
        </Button>
      </div>
    </div>
  );
}

function Indicator({ label, name }: { label: string; name?: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center soft-shadow">
      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm text-foreground">{name ?? "—"}</p>
    </div>
  );
}

function Mannequin({
  top,
  bottom,
  shoe,
  topsEmpty,
  bottomsEmpty,
  shoesEmpty,
  onSwipe,
  onAdd,
}: {
  top?: Garment;
  bottom?: Garment;
  shoe?: Garment;
  topsEmpty: boolean;
  bottomsEmpty: boolean;
  shoesEmpty: boolean;
  onSwipe: (slot: Slot, dir: 1 | -1) => void;
  onAdd: () => void;
}) {
  return (
    <div className="relative mx-auto aspect-[3/5] w-full max-w-xs">
      {/* silhouette — subtle ghost underlay, scaled to 55% and faded */}
      <svg
        viewBox="0 0 100 170"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.15, transform: "scale(0.55)", transformOrigin: "center center" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="mannequin" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#EFE6D9" />
            <stop offset="100%" stopColor="#E2D6C2" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="14" r="9" fill="url(#mannequin)" />
        <rect x="46" y="22" width="8" height="6" fill="url(#mannequin)" />
        <path d="M30 28 Q50 24 70 28 L66 80 L34 80 Z" fill="url(#mannequin)" />
        <path d="M36 80 L46 80 L44 150 L38 150 Z" fill="url(#mannequin)" />
        <path d="M54 80 L64 80 L62 150 L56 150 Z" fill="url(#mannequin)" />
        <path d="M28 30 L24 70 L29 70 L33 32 Z" fill="url(#mannequin)" />
        <path d="M72 30 L76 70 L71 70 L67 32 Z" fill="url(#mannequin)" />
      </svg>

      {/* Garments layered on a single transparent canvas */}
      {/* Shoes — back layer */}
      <GarmentLayer
        garment={shoe}
        empty={shoesEmpty}
        onAdd={onAdd}
        compact
        style={{ top: "78%", height: "20%", width: "50%", zIndex: 1 }}
      />
      {/* Bottom — middle layer */}
      <GarmentLayer
        garment={bottom}
        empty={bottomsEmpty}
        onAdd={onAdd}
        style={{ top: "36%", height: "40%", width: "70%", zIndex: 2 }}
      />
      {/* Top — front layer, overlaps bottom at waist */}
      <GarmentLayer
        garment={top}
        empty={topsEmpty}
        onAdd={onAdd}
        style={{
          top: "6%",
          height: "40%",
          width: "70%",
          zIndex: 3,
          filter: "drop-shadow(0 6px 10px rgba(45,42,38,0.18))",
        }}
      />



      {/* Swipe gesture zones (invisible) */}
      <SwipeZone
        className="absolute inset-x-0 z-20"
        style={{ top: "8%", height: "30%" }}
        onSwipe={(d) => onSwipe("top", d)}
      />
      <SwipeZone
        className="absolute inset-x-0 z-10"
        style={{ top: "40%", height: "35%" }}
        onSwipe={(d) => onSwipe("bottom", d)}
      />
      <SwipeZone
        className="absolute inset-x-0 z-0"
        style={{ top: "75%", height: "25%" }}
        onSwipe={(d) => onSwipe("shoes", d)}
      />

      {/* Floating arrows on the canvas sides */}
      {!topsEmpty && <Arrows top="20%" onPrev={() => onSwipe("top", -1)} onNext={() => onSwipe("top", 1)} label="top" />}
      {!bottomsEmpty && (
        <Arrows top="57%" onPrev={() => onSwipe("bottom", -1)} onNext={() => onSwipe("bottom", 1)} label="bottom" />
      )}
      {!shoesEmpty && (
        <Arrows top="82%" onPrev={() => onSwipe("shoes", -1)} onNext={() => onSwipe("shoes", 1)} label="shoes" />
      )}
    </div>
  );
}

function GarmentLayer({
  garment,
  empty,
  onAdd,
  compact,
  style,
}: {
  garment?: Garment;
  empty: boolean;
  onAdd: () => void;
  compact?: boolean;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
      style={style}
    >
      {empty ? (
        <div className="pointer-events-auto h-full w-full">
          <EmptySlot onAdd={onAdd} compact={compact} />
        </div>
      ) : garment?.imageUrl ? (
        <img
          src={garment.imageUrl}
          alt={garment.name}
          className="h-full w-full object-contain"
        />
      ) : garment ? (
        <GarmentVisual garment={garment} className="!h-full !w-full bg-transparent" />
      ) : null}
    </div>
  );
}

function Arrows({
  top,
  onPrev,
  onNext,
  label,
}: {
  top: string;
  onPrev: () => void;
  onNext: () => void;
  label: string;
}) {
  return (
    <>
      <button
        onClick={onPrev}
        aria-label={`Previous ${label}`}
        className="absolute left-[-8px] z-30 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-card/80 text-foreground soft-shadow opacity-70 hover:opacity-100"
        style={{ top }}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <button
        onClick={onNext}
        aria-label={`Next ${label}`}
        className="absolute right-[-8px] z-30 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-card/80 text-foreground soft-shadow opacity-70 hover:opacity-100"
        style={{ top }}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </>
  );
}

function EmptySlot({ onAdd, compact }: { onAdd: () => void; compact?: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-card/40 px-2 text-center hover:bg-card/70"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
        <Plus className="h-4 w-4" strokeWidth={1.75} />
      </span>
      {!compact && (
        <span className="text-[11px] leading-tight text-muted-foreground">
          Add items to your wardrobe
        </span>
      )}
    </button>
  );
}

function SwipeZone({
  className,
  style,
  onSwipe,
}: {
  className?: string;
  style?: React.CSSProperties;
  onSwipe: (dir: 1 | -1) => void;
}) {
  const startX = useRef<number | null>(null);
  return (
    <div
      className={className}
      style={style}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current == null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 30) onSwipe(dx > 0 ? -1 : 1);
        startX.current = null;
      }}
      onMouseDown={(e) => (startX.current = e.clientX)}
      onMouseUp={(e) => {
        if (startX.current == null) return;
        const dx = e.clientX - startX.current;
        if (Math.abs(dx) > 30) onSwipe(dx > 0 ? -1 : 1);
        startX.current = null;
      }}
    />
  );
}

