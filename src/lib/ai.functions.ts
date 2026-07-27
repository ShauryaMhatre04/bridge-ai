import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3.6-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const VisionInput = z.object({
  image: z.string().min(64).max(12_000_000),
  mode: z.enum(["scene", "navigation", "ocr", "currency", "medicine", "color"]),
  question: z.string().max(300).optional(),
});

const PROMPTS: Record<z.infer<typeof VisionInput>["mode"], string> = {
  scene:
    "You are a vision assistant for a blind user. Describe the scene in 2-3 short spoken sentences: people, objects, layout, and anything notable. Plain language, no markdown, no preamble.",
  navigation:
    "You are a mobility assistant for a blind pedestrian walking with a phone camera facing forward. Reply in at most 2 very short spoken sentences. Lead with any hazard (obstacle, step, vehicle, pole, hole, traffic light state, crosswalk) and its rough clock direction and distance in metres, then one clear instruction such as 'Path clear, continue straight.' No markdown, no preamble.",
  ocr: "Read every piece of text in this image, in reading order. Output only the text itself, preserving line breaks. If there is no text, reply exactly: No text detected.",
  currency:
    "Identify the banknotes or coins visible. State the currency and the total amount in one short spoken sentence. If uncertain, say so.",
  medicine:
    "This is medicine packaging or a label. State the medicine name, strength, and dosage instructions in short spoken sentences. If a warning or expiry date is visible, mention it. If anything is unreadable, say so clearly rather than guessing.",
  color: "Name the dominant colours of the main object in one short spoken sentence.",
};

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => VisionInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured for this project.");

    const prompt = data.question?.trim()
      ? `${PROMPTS[data.mode]}\n\nThe user also asks: ${data.question.trim()}`
      : PROMPTS[data.mode];

    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Too many requests right now. Wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    if (!res.ok) throw new Error(`AI request failed (${res.status}).`);

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("The AI returned an empty response.");
    return { text };
  });

const TranslateInput = z.object({
  text: z.string().min(1).max(2000),
  target: z.string().min(2).max(40),
});

export const translateCaption = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured for this project.");

    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `Translate the user's message into ${data.target}. Reply with the translation only, no notes.`,
          },
          { role: "user", content: data.text },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Translation failed (${res.status}).`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return { text: json.choices?.[0]?.message?.content?.trim() ?? "" };
  });
