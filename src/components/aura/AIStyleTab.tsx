import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAura } from "@/components/aura/store";
import { GarmentVisual } from "@/components/aura/Garment";
import { Send, ArrowRight } from "lucide-react";
import { generateAuraOutfit } from "@/lib/aura.functions";

type StyleResponse = {
  outfit: string[];
  headline: string;
  reasoning: string;
  alternatives: { swap_out: string; swap_in: string; why: string }[];
  source?: "ai" | "fallback";
};

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string }
  | { id: string; role: "assistant"; style: StyleResponse };

const SUGGESTED = ["Brunch with friends", "First date", "Lazy Sunday"];

const auraResponses = {
  brunch: {
    headline: "Soft morning, strong outfit",
    reasoning:
      "The blue satin with the flared jeans is an easy combination that feels considered without trying too hard. The brown shoes ground the whole thing with some warmth.",
    outfit: ["u-1779179889694", "u-1779179932624", "u-1779179197165"],
  },
  date: {
    headline: "Understated, on purpose",
    reasoning:
      "The maroon lace top over the fairy green skirt is an unexpected colour combination that works because both pieces are delicate in texture. Add the brown shoes to keep it grounded.",
    outfit: ["u-1779181156477", "u-1779180854608", "u-1779179197165"],
  },
  sunday: {
    headline: "Nowhere to be",
    reasoning:
      "The brown top and flared jeans is the most relaxed pairing in your wardrobe right now. Easy, comfortable, zero effort required.",
    outfit: ["u-1779182038860", "u-1779179932624", "u-1779179197165"],
  },
  work: {
    headline: "Serious, but make it yours",
    reasoning:
      "The striped punk top tucked into the fairy green skirt creates an interesting contrast between edge and softness. The brown shoes pull it into daytime territory.",
    outfit: ["u-1779179906139", "u-1779180854608", "u-1779179197165"],
  },
  party: {
    headline: "The one they remember",
    reasoning:
      "The two piece on its own is the whole outfit. Nothing else needed — just the brown shoes to finish it off.",
    outfit: ["u-1779179673248", "u-1779179197165"],
  },
  default: {
    headline: "Today's pick",
    reasoning:
      "The blue satin top with the flared jeans is the cleanest combination in your wardrobe right now. Works for almost anything you have going on today.",
    outfit: ["u-1779179889694", "u-1779179932624", "u-1779179197165"],
  },
};

type AuraKey = keyof typeof auraResponses;

function matchAuraKey(text: string): AuraKey {
  const lower = text.toLowerCase();
  if (lower.includes("brunch")) return "brunch";
  if (lower.includes("date")) return "date";
  if (lower.includes("sunday") || lower.includes("lazy")) return "sunday";
  if (lower.includes("work") || lower.includes("office")) return "work";
  if (lower.includes("party") || lower.includes("night")) return "party";
  return "default";
}

async function getAuraOutfit(
  callServerFn: ReturnType<typeof useServerFn<typeof generateAuraOutfit>>,
  userMessage: string,
  wardrobe: { id: string; name: string; category: string; color: string }[],
  temperature = 0.8,
): Promise<StyleResponse & { source: "ai" | "fallback" }> {
  try {
    const result = await callServerFn({
      data: { userMessage, wardrobe, temperature },
    });
    if (!result.ok) throw new Error(result.error);
    return {
      source: "ai",
      headline: result.headline,
      reasoning: result.reasoning,
      outfit: result.outfit,
      alternatives: result.alternatives,
    };
  } catch (err) {
    console.warn(
      "Gemini unavailable, using fallback:",
      err instanceof Error ? err.message : String(err),
    );
    const key = matchAuraKey(userMessage);
    const r = auraResponses[key];
    return {
      source: "fallback",
      headline: r.headline,
      reasoning: r.reasoning,
      outfit: r.outfit,
      alternatives: [],
    };
  }
}

export function AIStyleTab() {
  const { wardrobe, aiEnabled } = useAura();
  const callAura = useServerFn(generateAuraOutfit);
  const [messages, setMessages] = useState<Msg[]>([
    { id: "w", role: "assistant", text: "Hi! What's the vibe today? ☁️" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: t }]);
    setInput("");
    setTyping(true);

    console.log(
      "Wardrobe state:",
      wardrobe.map((g) => ({ id: g.id, name: g.name, category: g.category })),
    );

    try {
      const result = await getAuraOutfit(
        callAura,
        t,
        wardrobe.map((g) => ({
          id: g.id,
          name: g.name,
          category: g.category,
          color: g.color,
        })),
      );
      const wardrobeIds = new Set(wardrobe.map((g) => g.id));
      const missing = result.outfit.filter((id) => !wardrobeIds.has(id));
      if (missing.length > 0) {
        console.warn(`[Aura] Outfit references IDs not in wardrobe:`, missing);
      }
      const style: StyleResponse = {
        outfit: result.outfit,
        headline: result.headline,
        reasoning: result.reasoning,
        alternatives: result.alternatives ?? [],
        source: result.source,
      };
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", style },
      ]);
    } catch (err) {
      console.error("Error:", err);
      const key = matchAuraKey(t);
      const r = auraResponses[key];
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          style: {
            outfit: r.outfit,
            headline: r.headline,
            reasoning: r.reasoning,
            alternatives: [],
            source: "fallback",
          },
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  if (!aiEnabled) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center px-8 text-center">
        <h2 className="serif text-3xl">AI Style is off</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You're in control. Turn it on in Settings whenever you'd like a second opinion.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col pb-2">
      <header className="px-5 pt-8 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your stylist</p>
        <h1 className="mt-1 text-4xl text-foreground">AI Style</h1>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground soft-shadow">
                  {m.text}
                </div>
              </div>
            );
          }
          if ("style" in m) {
            return <StyleCard key={m.id} style={m.style} wardrobe={wardrobe} />;
          }
          return (
            <div key={m.id} className="max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-sm text-foreground soft-shadow">
              {m.text}
            </div>
          );
        })}
        {typing && (
          <div className="flex max-w-[60%] gap-1.5 rounded-2xl rounded-bl-md bg-card px-4 py-3 soft-shadow">
            <Dot delay={0} />
            <Dot delay={150} />
            <Dot delay={300} />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto px-5 pb-3">
        {SUGGESTED.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        className="flex items-center gap-2 px-5 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the vibe…"
          className="flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          aria-label="Send"
          className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground soft-shadow hover:scale-105 active:scale-95"
        >
          <Send className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}

function StyleCard({
  style,
  wardrobe,
}: {
  style: StyleResponse;
  wardrobe: ReturnType<typeof useAura>["wardrobe"];
}) {
  const findItem = (id: string) => wardrobe.find((g) => g.id === id);
  return (
    <div className="space-y-3 rounded-2xl bg-card p-4 soft-shadow">
      <h2 className="serif text-2xl text-foreground">{style.headline}</h2>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {style.outfit.map((id) => {
          const g = findItem(id);
          if (!g) return null;
          return (
            <div key={id} className="flex w-24 shrink-0 flex-col items-center">
              <GarmentVisual garment={g} size="md" />
              <span className="mt-1 w-full truncate text-center text-[10px] text-muted-foreground">
                {g.name}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm leading-relaxed text-foreground">{style.reasoning}</p>

      {style.alternatives?.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Or try</p>
          {style.alternatives.map((alt, i) => {
            const out = findItem(alt.swap_out);
            const inn = findItem(alt.swap_in);
            if (!out || !inn) return null;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-2"
              >
                <div className="flex w-14 shrink-0 flex-col items-center">
                  <GarmentVisual garment={out} size="sm" />
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex w-14 shrink-0 flex-col items-center">
                  <GarmentVisual garment={inn} size="sm" />
                </div>
                <span className="flex-1 text-xs text-foreground">{alt.why}</span>
              </div>
            );
          })}
        </div>
      )}
      {style.source === "fallback" && (
        <p className="text-center text-[10px] text-muted-foreground">✦ offline mode</p>
      )}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
