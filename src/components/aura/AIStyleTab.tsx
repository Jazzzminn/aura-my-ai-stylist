import { useState, useRef, useEffect } from "react";
import { useAura } from "@/components/aura/store";
import { AI_FLOWS } from "@/lib/aura";
import { GarmentVisual } from "@/components/aura/Garment";
import { Send } from "lucide-react";

type Msg =
  | { id: string; role: "assistant" | "user"; text: string }
  | { id: string; role: "assistant"; text: string; pickIds: string[] };

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

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const flow =
        AI_FLOWS.find((f) => f.prompt.toLowerCase() === t.toLowerCase()) ??
        AI_FLOWS[Math.floor(Math.random() * AI_FLOWS.length)];
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: flow.reply,
          pickIds: flow.pickIds,
        } as Msg,
      ]);
      setTyping(false);
    }, 1500);
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
          const pickIds = "pickIds" in m ? m.pickIds : undefined;
          return (
            <div key={m.id} className="space-y-3">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-sm text-foreground soft-shadow">
                {m.text}
              </div>
              {pickIds && (
                <div className="grid grid-cols-3 gap-2">
                  {pickIds.map((id) => {
                    const g = wardrobe.find((x) => x.id === id);
                    if (!g) return null;
                    return (
                      <div
                        key={id}
                        className="flex flex-col items-center rounded-2xl bg-card p-3 soft-shadow"
                      >
                        <GarmentVisual garment={g} size="sm" />
                        <span className="mt-1 text-[10px] text-muted-foreground truncate w-full text-center">
                          {g.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
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

      {/* Suggested prompts */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3">
        {AI_FLOWS.map((f) => (
          <button
            key={f.prompt}
            onClick={() => send(f.prompt)}
            className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
          >
            {f.prompt}
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

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
