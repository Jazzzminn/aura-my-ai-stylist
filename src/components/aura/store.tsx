import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  INITIAL_OUTFITS,
  INITIAL_WARDROBE,
  type Garment,
  type Outfit,
} from "@/lib/aura";
import { getWardrobeFor, setWardrobeFor } from "@/lib/mock-db";

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
  // SSR-safe initial state; real data hydrates in the effect below.
  const [wardrobe, setWardrobe] = useState<Garment[]>(INITIAL_WARDROBE);
  const [outfits, setOutfits] = useState<Outfit[]>(INITIAL_OUTFITS);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const hydratedFor = useRef<string | null>(null);

  // Load this account's wardrobe from the mock DB whenever the email changes.
  useEffect(() => {
    const email = user.email;
    setWardrobe(getWardrobeFor(email));
    hydratedFor.current = email;
  }, [user.email]);

  // Persist wardrobe back to the mock DB, scoped to the current account.
  useEffect(() => {
    if (hydratedFor.current !== user.email) return;
    setWardrobeFor(user.email, wardrobe);
  }, [wardrobe, user.email]);

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
