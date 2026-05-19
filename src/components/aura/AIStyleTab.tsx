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
      const res = await fetch("/api/ai-style", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wardrobe,
          style: "relaxed, warm neutrals, slightly oversized",
          message: t,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", style: data as StyleResponse },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `Sorry — I couldn't put that together right now. ${e instanceof Error ? e.message : ""}`,
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
