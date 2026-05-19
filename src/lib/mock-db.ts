// Tiny client-side mock "database" for wardrobes, keyed by user email.
// Persists to localStorage so data survives reloads, and seeds test@test.com
// from whatever clothes the user has already added under any other account.
import { INITIAL_WARDROBE, type Garment } from "@/lib/aura";

const LEGACY_KEY = "aura.wardrobe.v1";
const NS = "aura.wardrobe.v1:";

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

// Find clothes anywhere in localStorage so we can seed the mock account.
function findAnyExistingWardrobe(excludeKey?: string): Garment[] | null {
  if (typeof window === "undefined") return null;
  try {
    // 1. Legacy global key
    const legacy = readKey(LEGACY_KEY);
    if (legacy && legacy.length > 0) return legacy;

    // 2. Any other namespaced account's wardrobe
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith(NS) || k === excludeKey) continue;
      const arr = readKey(k);
      if (arr && arr.length > 0) return arr;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getWardrobeFor(email: string | undefined): Garment[] {
  if (typeof window === "undefined") return INITIAL_WARDROBE;

  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) {
    return readKey(LEGACY_KEY) ?? INITIAL_WARDROBE;
  }

  const myKey = keyFor(normalized);
  const stored = readKey(myKey);
  if (stored && stored.length > 0) return stored;

  // First time loading this account: seed from any wardrobe the user already
  // has on this device, so test@test.com (or any new account) is pre-filled.
  const seed = findAnyExistingWardrobe(myKey) ?? INITIAL_WARDROBE;
  try {
    window.localStorage.setItem(myKey, JSON.stringify(seed));
  } catch {
    // ignore
  }
  return seed;
}

export function setWardrobeFor(email: string | undefined, garments: Garment[]) {
  if (typeof window === "undefined") return;
  const normalized = (email ?? "").trim().toLowerCase();
  const key = normalized ? keyFor(normalized) : LEGACY_KEY;
  try {
    window.localStorage.setItem(key, JSON.stringify(garments));
  } catch {
    // ignore
  }
}
