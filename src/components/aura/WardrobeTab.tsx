import { useAura } from "@/components/aura/store";
import { GarmentVisual } from "@/components/aura/Garment";
import type { Category } from "@/lib/aura";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, ChevronDown, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export function WardrobeTab() {
  const { wardrobe, addGarment } = useAura();
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawer1Open, setDrawer1Open] = useState(true);
  const [drawer2Open, setDrawer2Open] = useState(false);

  const tops = wardrobe.filter((g) => g.category === "top");
  const bottoms = wardrobe.filter((g) => g.category === "bottom");
  const longs = wardrobe.filter((g) => g.category === "dress" || g.category === "outerwear");
  const acc = wardrobe.filter((g) => g.category === "accessory" || g.category === "shoes");

  function handleOpenAdd() {
    setPreviewUrl(null);
    setSelectedFile(null);
    setSelectedCategory("");
    setOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleClose() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setSelectedCategory("");
    setOpen(false);
  }

  function confirmAdd() {
    if (!selectedFile || !selectedCategory) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addGarment({
        id: `u-${Date.now()}`,
        name: "New Item",
        category: selectedCategory,
        color: "#C9A98E",
        imageUrl: dataUrl,
        dateAdded: new Date().toISOString(),
      });
      toast.success("Item added!", { position: "bottom-center", duration: 2000 });
      handleClose();
    };
    reader.readAsDataURL(selectedFile);
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

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-card sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add to Wardrobe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image input & preview */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {previewUrl ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-2xl border border-border overflow-hidden"
                >
                  <img
                    src={previewUrl}
                    alt="Selected garment"
                    className="w-full h-48 object-contain bg-secondary/30"
                  />
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/30 hover:bg-secondary/50"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" strokeWidth={1.25} />
                  <span className="text-sm text-muted-foreground">Tap to upload an image</span>
                </button>
              )}
            </div>

            {/* Category select */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Tops</SelectItem>
                  <SelectItem value="bottom">Bottoms</SelectItem>
                  <SelectItem value="dress">Dresses & Coats</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessory">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={confirmAdd}
              disabled={!previewUrl || !selectedCategory}
              className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Add Item
            </Button>
          </div>
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
