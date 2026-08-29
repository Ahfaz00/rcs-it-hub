import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(7, { message: "Enter a valid phone number" })
  .max(20, { message: "Phone number is too long" });

export const enquirySchema = z.object({
  name: z.string().trim().min(2, { message: "Enter your name" }).max(100),
  company_name: z.string().trim().max(150).optional().or(z.literal("")),
  phone,
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  requirement_type: z.string().trim().max(100).optional().or(z.literal("")),
  product_category: z.string().trim().max(100).optional().or(z.literal("")),
  product_id: z.string().uuid().optional().or(z.literal("")),
  product_name: z.string().trim().max(200).optional().or(z.literal("")),
  quantity: z.string().trim().max(50).optional().or(z.literal("")),
  budget: z.string().trim().max(50).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.string().trim().max(50).default("website"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, { message: "Enter your name" }).max(100),
  phone,
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(5, { message: "Please add a short message" }).max(2000),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => enquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    ) as typeof data;

    const { error } = await supabase.from("enquiries").insert(payload as never);
    if (error) throw new Error("We could not submit your enquiry. Please try again or call us.");
    return { ok: true };
  });

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    ) as typeof data;

    const { error } = await supabase.from("contact_submissions").insert(payload as never);
    if (error) throw new Error("We could not send your message. Please try again or call us.");
    return { ok: true };
  });
