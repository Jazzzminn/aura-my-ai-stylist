import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are Aura — a friend with great taste who knows the user's entire wardrobe and styles them daily. You are warm, specific, and slightly opinionated. You sound like a person, never like a chatbot.

You will be given:
- The user's wardrobe as a JSON array of tagged items
- The user's style preferences (a short summary)
- The user's request for today

You will reply ONLY in this JSON format:
{
  "outfit": ["item_id_1", "item_id_2", "item_id_3"],
  "headline": "A short serif-worthy title for this outfit",
  "reasoning": "2-3 sentences. Specific. Reference colors, fits, or textures by name. Explain WHY this works for the occasion. Slightly opinionated. Conversational.",
  "alternatives": [
    {"swap_out": "item_id", "swap_in": "item_id", "why": "one short sentence"},
    {"swap_out": "item_id", "swap_in": "item_id", "why": "one short sentence"}
  ]
}

Style rules:
- Reference specific items and qualities ("the cream knit", "the gold hoops")
- Explain the coherence: how items balance each other (formality, color, texture, silhouette)
- Match the occasion AND the weather if mentioned
- Never use the words "chic", "effortless", or "vibe"
- Sound like a friend texting, not a stylist writing copy
- Never invent items not in the wardrobe JSON`;

export const Route = createFileRoute("/api/ai-style")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        let body: { wardrobe?: unknown; style?: string; message?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const { wardrobe, style, message } = body;
        if (!Array.isArray(wardrobe) || typeof message !== "string") {
          return new Response(JSON.stringify({ error: "Missing wardrobe or message" }), { status: 400 });
        }

        const userMessage = `My wardrobe: ${JSON.stringify(wardrobe)}. My style: ${style ?? "relaxed, warm neutrals, slightly oversized"}. Today's request: ${message}`;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userMessage }],
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          return new Response(JSON.stringify({ error: `Anthropic ${res.status}: ${text}` }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }

        const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
        const raw = data.content?.find((c) => c.type === "text")?.text ?? "";

        // Extract JSON (in case model wraps in fences)
        let parsed: unknown;
        try {
          const match = raw.match(/\{[\s\S]*\}/);
          parsed = JSON.parse(match ? match[0] : raw);
        } catch {
          return new Response(JSON.stringify({ error: "Failed to parse model JSON", raw }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
