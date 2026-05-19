import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  INITIAL_OUTFITS,
  INITIAL_WARDROBE,
  type Garment,
  type Outfit,
} from "@/lib/aura";

const WARDROBE_KEY = "aura.wardrobe.v1";

function loadWardrobe(): Garment[] {
  if (typeof window === "undefined") return INITIAL_WARDROBE;
  try {
    const raw = window.localStorage.getItem(WARDROBE_KEY);
    if (!raw) return INITIAL_WARDROBE;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Garment[];
    return INITIAL_WARDROBE;
  } catch {
    return INITIAL_WARDROBE;
  }
}

export type Post = { id: string; name: string; photoUrl: string };

type AuraState = {
  user: { name: string; email: string };
  setUser: (u: { name: string; email: string }) => void;
  wardrobe: Garment[];
  addGarment: (g: Garment) => void;
  removeGarment: (id: string) => void;
  renameGarment: (id: string, name: string) => void;
  outfits: Outfit[];
  addOutfit: (o: Outfit) => void;
  posts: Post[];
  addPost: (p: Post) => void;
  renamePost: (id: string, name: string) => void;
  removePost: (id: string) => void;
  aiEnabled: boolean;
  setAiEnabled: (v: boolean) => void;
  addItemOpen: boolean;
  openAddItem: () => void;
  closeAddItem: () => void;
};

const Ctx = createContext<AuraState | null>(null);

export function AuraProvider({ children, initialEmail }: { children: ReactNode; initialEmail?: string }) {
  const [user, setUser] = useState({ name: "You", email: initialEmail ?? "" });
  const [wardrobe, setWardrobe] = useState<Garment[]>(loadWardrobe);
  const [outfits, setOutfits] = useState<Outfit[]>(INITIAL_OUTFITS);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WARDROBE_KEY, JSON.stringify(wardrobe));
    } catch {
      // ignore quota/serialization errors
    }
  }, [wardrobe]);

  const value = useMemo<AuraState>(
    () => ({
      user,
      setUser,
      wardrobe,
      addGarment: (g) => setWardrobe((w) => [...w, g]),
      removeGarment: (id) => setWardrobe((w) => w.filter((g) => g.id !== id)),
      renameGarment: (id, name) =>
        setWardrobe((w) => w.map((g) => (g.id === id ? { ...g, name } : g))),
      outfits,
      addOutfit: (o) => setOutfits((arr) => [o, ...arr]),
      posts,
      addPost: (p) => setPosts((arr) => [p, ...arr]),
      renamePost: (id, name) =>
        setPosts((arr) => arr.map((p) => (p.id === id ? { ...p, name } : p))),
      removePost: (id) => setPosts((arr) => arr.filter((p) => p.id !== id)),
      aiEnabled,
      setAiEnabled,
      addItemOpen,
      openAddItem: () => setAddItemOpen(true),
      closeAddItem: () => setAddItemOpen(false),
    }),
    [user, wardrobe, outfits, posts, aiEnabled, addItemOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAura() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAura must be inside AuraProvider");
  return ctx;
}
