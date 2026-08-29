import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnquiry, enquirySchema } from "@/lib/leads.functions";
import { siteQueryOptions } from "@/lib/site-query";

export function EnquiryDialog({
  productId,
  productName,
  trigger,
  source = "product-page",
}: {
  productId?: string;
  productName?: string;
  trigger: React.ReactNode;
  source?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = useServerFn(submitEnquiry);
  const { data: site } = useSuspenseQuery(siteQueryOptions);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      company_name: String(form.get("company_name") ?? ""),
      city: String(form.get("city") ?? ""),
      quantity: String(form.get("quantity") ?? ""),
      message: String(form.get("message") ?? ""),
      product_id: productId ?? "",
      product_name: productName ?? "",
      requirement_type: "Product Enquiry",
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
      toast.success("Enquiry sent. We will get back to you shortly.");
      setOpen(false);
    } catch {
      toast.error(
        `Could not send your enquiry. Please call us${site.settings["phone"] ? ` on ${site.settings["phone"]}` : ""}.`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send an enquiry</DialogTitle>
          <DialogDescription>
            {productName
              ? `Ask us about ${productName} - price, configuration and availability.`
              : "Tell us what you need and we will respond with pricing and availability."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required error={errors["name"]} />
            <Field label="Phone" name="phone" type="tel" required error={errors["phone"]} />
            <Field label="Email" name="email" type="email" error={errors["email"]} />
            <Field label="Company" name="company_name" error={errors["company_name"]} />
            <Field label="City" name="city" error={errors["city"]} />
            <Field label="Quantity" name="quantity" placeholder="e.g. 10 units" error={errors["quantity"]} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-message">Message</Label>
            <Textarea
              id="enquiry-message"
              name="message"
              rows={4}
              maxLength={2000}
              placeholder="Configuration required, timeline, any specific questions"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Sending..." : "Send enquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`enquiry-${name}`}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input id={`enquiry-${name}`} name={name} type={type} placeholder={placeholder} maxLength={200} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
