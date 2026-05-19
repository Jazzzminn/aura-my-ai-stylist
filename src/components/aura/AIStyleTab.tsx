import { useState, useRef, useEffect } from "react";
import { useAura } from "@/components/aura/store";
import { GarmentVisual } from "@/components/aura/Garment";
import { Send, ArrowRight } from "lucide-react";

type StyleResponse = {
  outfit: string[];
  headline: string;
  reasoning: string;
  alternatives: { swap_out: string; swap_in: string; why: string }[];
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
      "The cream wide-legs and white Oxford keep it relaxed but pulled-together — nothing too try-hard for a Sunday table. Add the gold hoops and the brown suede bag to lift it without overthinking it.",
    outfit: ["t3", "b1", "s2", "a2", "a1"],
  },
  date: {
    headline: "Understated, on purpose",
    reasoning:
      "The black crewneck over the olive trousers is the kind of outfit that looks like you didn't try, which is exactly the point. The brown Chelsea boots ground it. Keep jewellery minimal — just the silver chain.",
    outfit: ["t2", "b3", "s1", "a2"],
  },
  sunday: {
    headline: "Nowhere to be",
    reasoning:
      "Black shorts, the Paris tee, and your Sambas. Comfortable but not sloppy — the Sambas do the heavy lifting here. Grab the LA cap if you're stepping outside.",
    outfit: ["t4", "b4", "s2", "a3"],
  },
  work: {
    headline: "Serious, but make it yours",
    reasoning:
      "The blue stripe Oxford tucked into the black gingham skirt is an unexpected combination that works because the scale of the patterns don't compete. White sneakers keep it from going too formal.",
    outfit: ["top_002", "bottom_006", "shoes_002", "acc_005"],
  },
  party: {
    headline: "The one they remember",
    reasoning:
      "Royal blue sweatshirt, cream cargo trousers, and the blue Spezials — monochromatic without being matchy. The yellow crescent bag is the whole personality of this outfit.",
    outfit: ["top_007", "bottom_005", "shoes_005", "acc_003"],
  },
  default: {
    headline: "Today's pick",
    reasoning:
      "The white fitted tee and olive wide-legs is the cleanest combination in your wardrobe right now. Easy, adaptable, works for almost anything you've got going on today.",
    outfit: ["top_003", "bottom_001", "shoes_001", "acc_007"],
  },
};

type AuraKey = keyof typeof auraResponses;

function matchAuraKey(text: string): AuraKey {
  const lower = text.toLowerCase();
  if (lower.includes("brunch")) return "brunch";
  if (lower.includes("date")) return "date";
  if (lower.includes("sunday") || lower.includes("lazy")) return "sunday";
  if (lower.includes("work") || lower.includes("office")) return "work";
  if (lower.includes("party") || lower.includes("night out")) return "party";
  return "default";
}

export function AIStyleTab() {
  const { wardrobe, aiEnabled } = useAura();
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

    try {
      await new Promise((r) => setTimeout(r, 700));
      const key = matchAuraKey(t);
      const matched = auraResponses[key];
      const style: StyleResponse = {
        outfit: matched.outfit,
        headline: matched.headline,
        reasoning: matched.reasoning,
        alternatives: [],
      };
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", style },
      ]);
    } catch (err) {
      console.error("Error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `Aura is offline — ${msg}`,
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
      <p className="text-center text-[10px] text-muted-foreground">✦ AI styling coming soon</p>
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
