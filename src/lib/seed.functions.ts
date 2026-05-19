import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";


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

    // No garment seeding — the demo account starts empty so users only see
    // real clothes they add (which then sync across devices via Supabase).


    return { ok: true as const, email: TEST_EMAIL };
  },
);
