import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { INITIAL_WARDROBE } from "@/lib/aura";

const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "test1234";

// Idempotently ensure the demo test@test.com account exists with a seeded wardrobe.
// Safe to call from the public login page on mount.
export const ensureTestAccount = createServerFn({ method: "POST" }).handler(
  async () => {
    // 1. Find or create the user
    let userId: string | null = null;
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) {
      console.error("listUsers failed", listErr);
      return { ok: false as const, error: listErr.message };
    }
    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === TEST_EMAIL,
    );
    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          email_confirm: true,
        });
      if (createErr || !created.user) {
        console.error("createUser failed", createErr);
        return { ok: false as const, error: createErr?.message ?? "create failed" };
      }
      userId = created.user.id;
    }

    // 2. Seed garments only if none yet for this user
    const { count, error: countErr } = await supabaseAdmin
      .from("garments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (countErr) {
      console.error("count failed", countErr);
      return { ok: false as const, error: countErr.message };
    }
    if ((count ?? 0) === 0) {
      const rows = INITIAL_WARDROBE.map((g) => ({
        user_id: userId!,
        name: g.name,
        category: g.category,
        color: g.color,
        pattern: g.pattern ?? null,
        image_url: g.imageUrl ?? null,
      }));
      const { error: insErr } = await supabaseAdmin.from("garments").insert(rows);
      if (insErr) {
        console.error("seed insert failed", insErr);
        return { ok: false as const, error: insErr.message };
      }
    }

    return { ok: true as const, email: TEST_EMAIL };
  },
);
