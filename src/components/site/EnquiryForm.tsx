import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { submitEnquiry, enquirySchema } from "@/lib/leads.functions";

export function EnquiryForm({
  productId,
  productName,
  source = "website",
  title = "Send an enquiry",
  description = "Share your details and our team will get back with pricing and availability.",
  className,
}: {
  productId?: string | undefined;
  productName?: string | undefined;
  source?: string;
  title?: string;
  description?: string;
  className?: string | undefined;
}) {
  const submit = useServerFn(submitEnquiry);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [wantsQuote, setWantsQuote] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
      product_id: productId ?? "",
      product_name: productName ?? "",
      requirement_type: wantsQuote ? "Quote Request" : "General Enquiry",
      source,
    };

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await submit({ data: parsed.data });
      setDone(true);
      toast.success("Enquiry received. Our team will contact you shortly.");
    } catch {
      toast.error("Could not send your enquiry. Please try WhatsApp or call us.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-6 md:p-8 ${className ?? ""}`}>
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      {done ? (
        <p className="mt-6 rounded-xl bg-success/10 p-4 text-sm font-medium text-success">
          Thanks — your enquiry is with our sales team. We will call you back soon.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ef-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="ef-name" name="name" maxLength={100} placeholder="Your full name" />
            {errors["name"] ? <p className="text-xs text-destructive">{errors["name"]}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ef-phone">
              Mobile number <span className="text-destructive">*</span>
            </Label>
            <Input id="ef-phone" name="phone" type="tel" maxLength={20} placeholder="10-digit mobile" />
            {errors["phone"] ? <p className="text-xs text-destructive">{errors["phone"]}</p> : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ef-email">Email (optional)</Label>
            <Input id="ef-email" name="email" type="email" maxLength={255} placeholder="you@company.com" />
            {errors["email"] ? <p className="text-xs text-destructive">{errors["email"]}</p> : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ef-message">Message</Label>
            <Textarea
              id="ef-message"
              name="message"
              rows={4}
              maxLength={2000}
              placeholder={
                productName
                  ? `Quantity, configuration or questions about ${productName}`
                  : "Tell us what you are looking for — models, quantity, timeline"
              }
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
            <Checkbox checked={wantsQuote} onCheckedChange={(v) => setWantsQuote(v === true)} />
            <span className="font-medium">Request a price quote</span>
          </label>
          <Button type="submit" disabled={busy} className="h-12 rounded-full sm:col-span-2">
            {busy ? "Sending..." : wantsQuote ? "Request quote" : "Send enquiry"}
          </Button>
        </form>
      )}
    </div>
  );
}
