import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_OUTFITS,
  INITIAL_WARDROBE,
  type Category,
  type Garment,
  type Outfit,
} from "@/lib/aura";
import { supabase } from "@/integrations/supabase/client";

export type Post = { id: string; name: string; photoUrl: string };

type AuraState = {
  user: { name: string; email: string; id: string | null };
  setUser: (u: { name: string; email: string }) => void;
  wardrobe: Garment[];
  loading: boolean;
  addGarment: (g: Garment) => Promise<void>;
  removeGarment: (id: string) => Promise<void>;
  renameGarment: (id: string, name: string) => Promise<void>;
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

type Row = {
  id: string;
  name: string;
  category: string;
  color: string;
  pattern: string | null;
  image_url: string | null;
  date_added: string;
};

function rowToGarment(r: Row): Garment {
  return {
    id: r.id,
    name: r.name,
    category: r.category as Category,
    color: r.color,
    pattern: r.pattern ?? undefined,
    imageUrl: r.image_url ?? undefined,
    dateAdded: r.date_added,
  };
}

export function AuraProvider({
  children,
  initialEmail,
}: {
  children: ReactNode;
  initialEmail?: string;
}) {
  const [user, setUserState] = useState<{ name: string; email: string; id: string | null }>(
    { name: "You", email: initialEmail ?? "", id: null },
  );
  const [wardrobe, setWardrobe] = useState<Garment[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>(INITIAL_OUTFITS);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Track the signed-in Supabase user.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUserState({
        name: "You",
        email: u?.email ?? "",
        id: u?.id ?? null,
      });
    });
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUserState({
        name: "You",
        email: u?.email ?? initialEmail ?? "",
        id: u?.id ?? null,
      });
    });
    return () => sub.subscription.unsubscribe();
  }, [initialEmail]);

  // Load this user's wardrobe whenever the auth user changes.
  useEffect(() => {
    if (!user.id) {
      setWardrobe([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("garments")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("load garments", error);
          setWardrobe([]);
        } else {
          setWardrobe((data as Row[]).map(rowToGarment));
        }
        setLoading(false);
      });
  }, [user.id]);

  const addGarment = useCallback(
    async (g: Garment) => {
      if (!user.id) return;
      const { data, error } = await supabase
        .from("garments")
        .insert({
          user_id: user.id,
          name: g.name,
          category: g.category,
          color: g.color,
          pattern: g.pattern ?? null,
          image_url: g.imageUrl ?? null,
        })
        .select("*")
        .single();
      if (error || !data) {
        console.error("add garment", error);
        return;
      }
      setWardrobe((w) => [...w, rowToGarment(data as Row)]);
    },
    [user.id],
  );

  const removeGarment = useCallback(async (id: string) => {
    const prev = wardrobe;
    setWardrobe((w) => w.filter((g) => g.id !== id));
    const { error } = await supabase.from("garments").delete().eq("id", id);
    if (error) {
      console.error("remove garment", error);
      setWardrobe(prev);
    }
  }, [wardrobe]);

  const renameGarment = useCallback(async (id: string, name: string) => {
    setWardrobe((w) => w.map((g) => (g.id === id ? { ...g, name } : g)));
    const { error } = await supabase.from("garments").update({ name }).eq("id", id);
    if (error) console.error("rename garment", error);
  }, []);

  const setUser = useCallback((u: { name: string; email: string }) => {
    setUserState((prev) => ({ ...prev, ...u }));
  }, []);

  const value = useMemo<AuraState>(
    () => ({
      user,
      setUser,
      wardrobe,
      loading,
      addGarment,
      removeGarment,
      renameGarment,
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
    [
      user,
      setUser,
      wardrobe,
      loading,
      addGarment,
      removeGarment,
      renameGarment,
      outfits,
      posts,
      aiEnabled,
      addItemOpen,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAura() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAura must be inside AuraProvider");
  return ctx;
}
