import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  userMessage: z.string().min(1).max(500),
  wardrobe: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
        color: z.string(),
      }),
    )
    .max(200),
  temperature: z.number().min(0).max(2).optional(),
});

const SYSTEM_PROMPT = `You are Aura, a warm, perceptive personal stylist. Given a user's vibe/occasion and their wardrobe (array of items with id, name, category, color), respond with ONLY valid JSON in this shape:
{
  "headline": "short poetic title",
  "reasoning": "2-3 sentences, warm and specific about why these pieces work",
  "outfit": ["id1", "id2", "id3"],
  "alternatives": []
}
Only use ids that exist in the provided wardrobe. No markdown, no commentary outside the JSON.`;

export type AuraOutfitResult = {
  ok: true;
  headline: string;
  reasoning: string;
  outfit: string[];
  alternatives: { swap_out: string; swap_in: string; why: string }[];
} | {
  ok: false;
  error: string;
};

export const generateAuraOutfit = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<AuraOutfitResult> => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "GOOGLE_API_KEY not configured" };
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${SYSTEM_PROMPT}\n\nWardrobe: ${JSON.stringify(data.wardrobe)}\n\nUser: ${data.userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: data.temperature ?? 0.8,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        },
      );

      if (!res.ok) {
        const body = await res.text();
        console.error("Gemini error", res.status, body);
        return { ok: false, error: `Gemini ${res.status}` };
      }

      const json = await res.json();
      const text: string | undefined =
        json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return { ok: false, error: "No candidates" };

      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (!Array.isArray(parsed.outfit) || !parsed.reasoning) {
        return { ok: false, error: "Bad response shape" };
      }

      return {
        ok: true,
        headline: parsed.headline ?? "Today's pick",
        reasoning: parsed.reasoning,
        outfit: parsed.outfit,
        alternatives: parsed.alternatives ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Aura server fn error:", msg);
      return { ok: false, error: msg };
    }
  });
