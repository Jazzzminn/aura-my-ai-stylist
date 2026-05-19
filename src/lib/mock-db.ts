// Tiny client-side mock "database" for wardrobes, keyed by user email.
// Persists to localStorage so data survives reloads, and seeds test@test.com
// from the legacy global wardrobe (i.e. clothes the current user already added)
// the first time that account is loaded.
import { INITIAL_WARDROBE, type Garment } from "@/lib/aura";

const LEGACY_KEY = "aura.wardrobe.v1";
const NS = "aura.wardrobe.v1:";
const SEEDED_FLAG = "aura.mockdb.seeded.v1";

export const MOCK_TEST_EMAIL = "test@test.com";

function keyFor(email: string) {
  return `${NS}${email.trim().toLowerCase()}`;
}

function readKey(key: string): Garment[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Garment[]) : null;
  } catch {
    return null;
  }
}

function ensureSeeded() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(SEEDED_FLAG)) return;

    const testKey = keyFor(MOCK_TEST_EMAIL);
    if (!window.localStorage.getItem(testKey)) {
      // Prefer the clothes the user actually added (legacy global key),
      // otherwise fall back to the curated INITIAL_WARDROBE.
      const legacy = readKey(LEGACY_KEY);
      const seed = legacy && legacy.length > 0 ? legacy : INITIAL_WARDROBE;
      window.localStorage.setItem(testKey, JSON.stringify(seed));
    }

    window.localStorage.setItem(SEEDED_FLAG, "1");
  } catch {
    // ignore
  }
}

export function getWardrobeFor(email: string | undefined): Garment[] {
  if (typeof window === "undefined") return INITIAL_WARDROBE;
  ensureSeeded();

  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) {
    return readKey(LEGACY_KEY) ?? INITIAL_WARDROBE;
  }

  const stored = readKey(keyFor(normalized));
  if (stored) return stored;

  // First time we see this email: migrate the legacy global wardrobe so the
  // user's existing clothes carry over to their account.
  const legacy = readKey(LEGACY_KEY);
  if (legacy && legacy.length > 0) {
    try {
      window.localStorage.setItem(keyFor(normalized), JSON.stringify(legacy));
    } catch {
      // ignore
    }
    return legacy;
  }

  return INITIAL_WARDROBE;
}

export function setWardrobeFor(email: string | undefined, garments: Garment[]) {
  if (typeof window === "undefined") return;
  const normalized = (email ?? "").trim().toLowerCase();
  const key = normalized ? keyFor(normalized) : LEGACY_KEY;
  try {
    window.localStorage.setItem(key, JSON.stringify(garments));
  } catch {
    // ignore quota/serialization errors
  }
}
