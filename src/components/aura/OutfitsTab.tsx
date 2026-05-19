import { useAura } from "@/components/aura/store";
import { GarmentVisual } from "@/components/aura/Garment";
import { Pencil, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function OutfitsTab() {
  const { outfits, wardrobe, posts, addPost, renamePost, removePost } = useAura();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetDialog() {
    setPhoto(null);
    setName("");
  }

  function handlePick() {
    fileInputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function post() {
    if (!photo) {
      toast.error("Add a photo first");
      return;
    }
    const finalName =
      name.trim() ||
      `OOTD ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    addPost({ id: `p-${Date.now()}`, name: finalName, photoUrl: photo });
    toast.success("Added! Your OOTD is live ✨");
    setOpen(false);
    resetDialog();
  }

  return (
    <div className="pb-28">
      <header className="flex items-end justify-between px-5 pt-8 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved</p>
          <h1 className="mt-1 text-4xl text-foreground">Outfits</h1>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground soft-shadow hover:scale-[1.02]"
        >
          + Post your OOTD
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5">
        {posts.map((p) => (
          <PostTile
            key={p.id}
            post={p}
            onRename={(n) => renamePost(p.id, n)}
            onRemove={() => removePost(p.id)}
          />
        ))}

        {outfits.map((o) => {
          const top = wardrobe.find((g) => g.id === o.topId);
          const bot = wardrobe.find((g) => g.id === o.bottomId);
          const shoe = wardrobe.find((g) => g.id === o.shoesId);
          return (
            <div key={o.id} className="rounded-2xl bg-card p-3 soft-shadow">
              <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-xl bg-secondary/40">
                <MiniMannequin top={top} bottom={bot} shoe={shoe} />
              </div>
              <div className="mt-2">
                <p className="serif text-base">{o.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {[top?.name, bot?.name].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) resetDialog();
        }}
      >
        <DialogContent className="bg-card sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Post your OOTD</DialogTitle>
            <DialogDescription>Share today's look with your circle.</DialogDescription>
          </DialogHeader>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={handlePick}
            className="relative grid h-40 w-full place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground hover:bg-secondary/60"
          >
            {photo ? (
              <img src={photo} alt="OOTD preview" className="h-full w-full object-cover" />
            ) : (
              "Tap to add a photo"
            )}
          </button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your outfit (optional)"
            className="rounded-full"
          />
          <Button
            onClick={post}
            className="rounded-full bg-primary text-primary-foreground"
          >
            Post
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostTile({
  post,
  onRename,
  onRemove,
}: {
  post: { id: string; name: string; photoUrl: string };
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(post.name);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing, post.name]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== post.name) onRename(trimmed);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl bg-card p-3 soft-shadow">
      <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-xl bg-secondary/40">
        <img src={post.photoUrl} alt={post.name} className="h-full w-full object-cover" />
        <button
          onClick={onRemove}
          aria-label="Delete post"
          className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-foreground/70 text-background opacity-80 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            className="serif w-full bg-transparent text-base outline-none border-b border-border"
          />
        ) : (
          <>
            <p className="serif flex-1 truncate text-base">{post.name}</p>
            <button
              onClick={() => setEditing(true)}
              aria-label="Rename"
              className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MiniMannequin({ top, bottom, shoe }: any) {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 100 130" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="50" cy="12" r="7" fill="#E2D6C2" />
        <rect x="47" y="19" width="6" height="5" fill="#E2D6C2" />
        <path d="M32 24 Q50 21 68 24 L64 70 L36 70 Z" fill="#E2D6C2" />
        <path d="M38 70 L46 70 L44 115 L40 115 Z" fill="#E2D6C2" />
        <path d="M54 70 L62 70 L60 115 L56 115 Z" fill="#E2D6C2" />
      </svg>
      {top && (
        <div className="absolute left-1/2 top-[14%] h-[40%] w-[70%] -translate-x-1/2">
          <GarmentVisual garment={top} className="!h-full !w-full" />
        </div>
      )}
      {bottom && (
        <div className="absolute left-1/2 top-[48%] h-[40%] w-[55%] -translate-x-1/2">
          <GarmentVisual garment={bottom} className="!h-full !w-full" />
        </div>
      )}
      {shoe && (
        <div className="absolute left-1/2 bottom-[2%] h-[14%] w-[70%] -translate-x-1/2">
          <GarmentVisual garment={shoe} className="!h-full !w-full" />
        </div>
      )}
    </div>
  );
}
