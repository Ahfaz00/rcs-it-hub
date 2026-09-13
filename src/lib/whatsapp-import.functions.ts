import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  text: z.string().trim().min(10, { message: "Paste at least one WhatsApp post." }).max(20000),
  categories: z.array(z.string()).max(100).default([]),
  brands: z.array(z.string()).max(100).default([]),
});

export type ParsedProductDraft = {
  name: string;
  category: string | null;
  brand: string | null;
  condition: string | null;
  product_type: string | null;
  processor_model: string | null;
  ram: string | null;
  storage_capacity: string | null;
  display_size: string | null;
  operating_system: string | null;
  quantity: string | null;
  price: number | null;
  short_description: string | null;
};

const nullableString = { type: ["string", "null"] } as const;

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["products"],
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "category",
          "brand",
          "condition",
          "product_type",
          "processor_model",
          "ram",
          "storage_capacity",
          "display_size",
          "operating_system",
          "quantity",
          "price",
          "short_description",
        ],
        properties: {
          name: { type: "string" },
          category: nullableString,
          brand: nullableString,
          condition: nullableString,
          product_type: nullableString,
          processor_model: nullableString,
          ram: nullableString,
          storage_capacity: nullableString,
          display_size: nullableString,
          operating_system: nullableString,
          quantity: nullableString,
          price: { type: ["number", "null"] },
          short_description: nullableString,
        },
      },
    },
  },
} as const;

const SYSTEM = `You convert WhatsApp bulk-IT-stock posts into structured product records for a refurbished IT hardware wholesaler in India.

Rules:
- One record per distinct product or lot mentioned. Ignore greetings, contact numbers, addresses and links.
- Never invent data. If a value is not clearly stated in the post, return null.
- price: numeric INR value only when a price is explicitly written (strip Rs/₹/commas, treat "18k" as 18000). Otherwise null.
- quantity: keep it as written, e.g. "50 pcs", "12 lots".
- category and brand: choose from the provided lists when a clear match exists, otherwise null.
- name: a clean, human-readable product title without emojis or phone numbers.
- short_description: one factual sentence built only from details in the post.`;

export const parseWhatsappPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project yet.");

    const prompt = [
      `Known categories: ${data.categories.join(", ") || "(none)"}`,
      `Known brands: ${data.brands.join(", ") || "(none)"}`,
      "",
      "WhatsApp posts:",
      data.text,
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        instructions: SYSTEM,
        input: prompt,
        reasoning: { effort: "low" },
        text: {
          format: { type: "json_schema", name: "product_drafts", strict: true, schema: jsonSchema },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      if (res.status === 402) throw new Error("AI credits are exhausted. Please top up to keep using import.");
      if (res.status === 429) throw new Error("AI is busy right now. Please try again in a minute.");
      throw new Error(`Could not read the posts (${res.status}). ${body.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let output = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            output += event.delta;
          } else if (event.type === "response.completed" && event.response?.output_text) {
            if (!output) output = event.response.output_text;
          }
        } catch {
          /* ignore malformed keep-alive chunks */
        }
      }
    }

    if (!output.trim()) throw new Error("The AI could not read anything from that text. Please try again.");

    let parsed: { products?: ParsedProductDraft[] };
    try {
      parsed = JSON.parse(output) as { products?: ParsedProductDraft[] };
    } catch {
      throw new Error("The AI reply could not be understood. Please try again.");
    }

    const products = (parsed.products ?? []).filter((p) => p && typeof p.name === "string" && p.name.trim());
    return { products };
  });
